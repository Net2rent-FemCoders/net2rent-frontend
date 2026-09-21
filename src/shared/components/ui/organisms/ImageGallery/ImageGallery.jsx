import { useState, useCallback, useEffect } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../../molecules/Modal/Modal.jsx";
import "./ImageGallery.scss";

export default function ImageGallery({
  images = [],
  downloadPrefix = "imagen",
}) {
  const [openIndex, setOpenIndex] = useState(null);

  const showPrev = useCallback(
    () =>
      setOpenIndex((i) =>
        i == null ? i : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i == null ? i : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (openIndex == null) return;
    function onKey(e) {
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, showPrev, showNext]);

  if (images.length === 0) return null;

  const openImg = openIndex != null ? images[openIndex] : null;

  function downloadName() {
    const src = openImg?.src ?? "";
    const type = openImg?.type ?? src.match(/^data:(image\/\w+)/)?.[1] ?? "";
    const ext = type.includes("png") ? "png" : "jpg";
    return `${downloadPrefix}-${(openIndex ?? 0) + 1}.${ext}`;
  }

  return (
    <section className="image-gallery">
      <ul className="image-gallery__grid">
        {images.map((img, index) => (
          <li key={index} className="image-gallery__item">
            <button
              type="button"
              className="image-gallery__thumb"
              onClick={() => setOpenIndex(index)}
              aria-label={`Ver imagen ${index + 1} en grande`}
            >
              <img src={img.src} alt={`Imagen ${index + 1} de la incidencia`} />
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={openIndex != null}
        onClose={() => setOpenIndex(null)}
        title={`Imagen ${openIndex != null ? openIndex + 1 : ""} de ${images.length}`}
        footer={
          openImg && (
            <a
              className="image-gallery__download"
              href={openImg.src}
              download={downloadName()}
            >
              <Download size={16} aria-hidden="true" />
              Descargar
            </a>
          )
        }
      >
        {openImg && (
          <div className="image-gallery__viewer">
            {images.length > 1 && (
              <button
                type="button"
                className="image-gallery__nav image-gallery__nav--prev"
                onClick={showPrev}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
            )}

            <img
              className="image-gallery__full"
              src={openImg.src}
              alt={`Imagen ${(openIndex ?? 0) + 1} de la incidencia`}
            />

            {images.length > 1 && (
              <button
                type="button"
                className="image-gallery__nav image-gallery__nav--next"
                onClick={showNext}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}