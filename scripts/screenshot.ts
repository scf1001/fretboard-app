/**
 * Retakes the README screenshot (docs/screenshot.png): `npm run screenshot`.
 *
 * Starts the Vite dev server, opens the app in headless Chrome, and saves a crop of the
 * app column. Chrome is driven over the DevTools protocol (the same interface the
 * browser's own developer tools use) with Node's built-in WebSocket, so nothing extra
 * needs installing. If Chrome isn't found, set CHROME_PATH to its executable.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

/** What the screenshot shows. Settings go in localStorage, the rest in the URL. */
const QUERY = "?root=A&scale=minor-pentatonic&tuning=standard&labels=name";
const PREFERENCES = {
  wood: "rosewood",
  inlay: "trapezoids",
  volume: 100,
  leftHanded: false,
};
const VIEWPORT = { width: 1280, height: 900 };
/** Space kept below the fret numbers. */
const BOTTOM_PADDING = 16;
const OUTPUT = "docs/screenshot.png";
const DEBUG_PORT = 9333;

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) {
    throw new Error("Chrome not found. Set CHROME_PATH to its executable.");
  }
  return found;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Polls Chrome's HTTP endpoint until it lists a page, then returns its WebSocket URL. */
async function pageWebSocketUrl(): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
      const targets = (await response.json()) as {
        type: string;
        webSocketDebuggerUrl: string;
      }[];
      const page = targets.find((target) => target.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome hasn't started listening yet.
    }
    await sleep(200);
  }
  throw new Error("Chrome didn't start.");
}

/**
 * A minimal DevTools protocol client. Every message is JSON: commands carry an id that
 * the reply echoes back, and events (like "the page finished loading") carry a method name.
 */
class DevTools {
  private nextId = 1;
  private replies = new Map<number, (message: Message) => void>();
  private eventWaiters = new Map<string, () => void>();
  private socket: WebSocket;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as Message;
      if (message.id !== undefined) {
        this.replies.get(message.id)?.(message);
        this.replies.delete(message.id);
      } else if (message.method) {
        this.eventWaiters.get(message.method)?.();
        this.eventWaiters.delete(message.method);
      }
    });
  }

  static async connect(url: string): Promise<DevTools> {
    const socket = new WebSocket(url);
    await new Promise((resolve) => socket.addEventListener("open", resolve));
    return new DevTools(socket);
  }

  send<T = unknown>(method: string, params: object = {}): Promise<T> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.replies.set(id, (message) =>
        message.error
          ? reject(new Error(`${method}: ${message.error.message}`))
          : resolve(message.result as T),
      );
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method: string): Promise<void> {
    return new Promise((resolve) => this.eventWaiters.set(method, resolve));
  }

  /** Runs JavaScript in the page and returns its (JSON-serialisable) result. */
  async evaluate<T>(expression: string): Promise<T> {
    const { result } = await this.send<{ result: { value: T } }>(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true },
    );
    return result.value;
  }

  close() {
    this.socket.close();
  }
}

type Message = {
  id?: number;
  method?: string;
  result?: unknown;
  error?: { message: string };
};

/** Loads a URL and waits until the fretboard is drawn and the fonts have loaded. */
async function load(devTools: DevTools, url: string) {
  const loaded = devTools.waitForEvent("Page.loadEventFired");
  await devTools.send("Page.navigate", { url });
  await loaded;
  for (let attempt = 0; attempt < 50; attempt++) {
    const ready = await devTools.evaluate<boolean>(
      `document.fonts.ready.then(() => document.querySelector(".fretboard") !== null)`,
    );
    if (ready) return;
    await sleep(100);
  }
  throw new Error("The fretboard never rendered.");
}

async function main() {
  const server = await createServer({ logLevel: "error" });
  await server.listen();
  const appUrl = server.resolvedUrls!.local[0] + QUERY;

  // A throwaway browser profile, so this never touches your own Chrome's data.
  const profile = await mkdtemp(join(tmpdir(), "fretboard-screenshot-"));
  const chrome = spawn(findChrome(), [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "about:blank",
  ]);

  try {
    const devTools = await DevTools.connect(await pageWebSocketUrl());
    await devTools.send("Page.enable");
    await devTools.send("Emulation.setDeviceMetricsOverride", {
      ...VIEWPORT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await devTools.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: "light" }],
    });

    // localStorage belongs to the page's origin, so load the app once to set the
    // preferences, then reload so it starts up with them.
    await load(devTools, appUrl);
    await devTools.evaluate(
      `localStorage.setItem("fretboard-app:preferences", ${JSON.stringify(JSON.stringify(PREFERENCES))})`,
    );
    await load(devTools, appUrl);

    // Crop to the app column inside #root's 1px side borders, from the top of the page
    // to just below the fretboard.
    const clip = await devTools.evaluate<object>(`(() => {
      const root = document.getElementById("root").getBoundingClientRect();
      const board = document.querySelector(".fretboard-scroll").getBoundingClientRect();
      return { x: root.left + 1, y: 0, width: root.width - 2,
        height: Math.round(board.bottom) + ${BOTTOM_PADDING}, scale: 1 };
    })()`);
    const { data } = await devTools.send<{ data: string }>(
      "Page.captureScreenshot",
      { format: "png", clip },
    );
    await writeFile(OUTPUT, Buffer.from(data, "base64"));
    console.log(`Saved ${OUTPUT}`);
    devTools.close();
  } finally {
    chrome.kill();
    await server.close();
    // Chrome can hold its profile files open briefly after exiting, so retry.
    await rm(profile, { recursive: true, force: true, maxRetries: 5 });
  }
}

await main();
