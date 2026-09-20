import FileUpload from "../../molecules/FileUpload/FileUpload.jsx";
import "./PhotoUploadList.scss";

export default function PhotoUploadList({
  value = [],
  onChange,
  maxFiles = 3,
  disabled = false,
}) {
  const slots = value.length < maxFiles ? [...value, null] : value;
  const remaining = maxFiles - value.length;

  function handleSlotChange(index, fileOrFiles) {
    if (Array.isArray(fileOrFiles)) {
      onChange([...value, ...fileOrFiles].slice(0, maxFiles));
      return;
    }
    const next = [...value];
    if (fileOrFiles) {
      next[index] = fileOrFiles;
    } else {
      next.splice(index, 1);
    }
    onChange(next);
  }

  return (
    <div className="photo-upload-list">
      {slots.map((file, index) => (
        <FileUpload
          key={index}
          id={`photo-${index}`}
          value={file}
          accept="image/jpeg,image/png"
          multiple={file === null && remaining > 1}
          disabled={disabled}
          onChange={(selected) => handleSlotChange(index, selected)}
        />
      ))}
      {value.length > 0 && (
        <p className="photo-upload-list__count">
          {value.length}/{maxFiles} imágenes
        </p>
      )}
    </div>
  );
}