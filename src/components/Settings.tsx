import { useRef } from "react";
import { WOODS, type Wood } from "../lib/woods";
import "./Settings.css";

type SettingsProps = {
  wood: Wood;
  onWoodChange: (wood: Wood) => void;
};

function woodLabel(wood: Wood): string {
  return wood.charAt(0).toUpperCase() + wood.slice(1);
}

/**
 * A Settings button that opens a modal dialog of display preferences.
 * Choices apply immediately, so the fretboard behind the dialog previews them.
 */
function Settings({ wood, onWoodChange }: SettingsProps) {
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
                {woodLabel(option)}
              </option>
            ))}
          </select>
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
