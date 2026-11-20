import { useRef } from "react";
import { INLAYS, type Inlay } from "../lib/inlays";
import { WOODS, type Wood } from "../lib/woods";
import "./Settings.css";

type SettingsProps = {
  wood: Wood;
  onWoodChange: (wood: Wood) => void;
  inlay: Inlay;
  onInlayChange: (inlay: Inlay) => void;
  /** 0–100. */
  volume: number;
  onVolumeChange: (volume: number) => void;
  leftHanded: boolean;
  onLeftHandedChange: (leftHanded: boolean) => void;
};

/** "rosewood" -> "Rosewood". */
function optionLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * A Settings button that opens a modal dialog of personal preferences.
 * Choices apply immediately, so the fretboard behind the dialog previews them.
 */
function Settings({
  wood,
  onWoodChange,
  inlay,
  onInlayChange,
  volume,
  onVolumeChange,
  leftHanded,
  onLeftHandedChange,
}: SettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="settings-button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span aria-hidden="true">⚙</span> Settings
      </button>
      {/* showModal() gives us, for free: a backdrop, focus moved into the dialog and
          trapped there, Escape to close, and focus returned to the button afterwards. */}
      <dialog
        ref={dialogRef}
        className="settings-dialog"
        aria-labelledby="settings-title"
      >
        <h2 id="settings-title">Settings</h2>
        <label className="settings-row">
          Fretboard wood:
          <select
            value={wood}
            onChange={(event) => onWoodChange(event.target.value as Wood)}
          >
            {WOODS.map((option) => (
              <option key={option} value={option}>
                {optionLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-row">
          Fret inlays:
          <select
            value={inlay}
            onChange={(event) => onInlayChange(event.target.value as Inlay)}
          >
            {INLAYS.map((option) => (
              <option key={option} value={option}>
                {optionLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-row">
          Volume:
          {/* A native range input: arrow keys, Home/End and screen-reader announcements
              come for free. aria-valuetext makes it read "80%" rather than just "80". */}
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume}
            aria-valuetext={`${volume}%`}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
          <span className="settings-value" aria-hidden="true">
            {volume}%
          </span>
        </label>
        <label className="settings-row">
          <input
            type="checkbox"
            checked={leftHanded}
            onChange={(event) => onLeftHandedChange(event.target.checked)}
          />
          Left-handed
        </label>
        <div className="settings-actions">
          <button type="button" onClick={() => dialogRef.current?.close()}>
            Done
          </button>
        </div>
      </dialog>
    </>
  );
}

export default Settings;
