import { useContent } from "../hooks/useContent";
import { FALLBACK_GALLERY } from "../config/fallbackContent";

export default function Gallery() {
  const { data: images } = useContent("gallery_images_public", FALLBACK_GALLERY);

  return (
    <section className="gallery">
      <div className="container">
        <h2 className="section-heading">Around the group</h2>
        <div className="gallery__grid">
          {images.map((img) => (
            <figure key={img.id} className="gallery__item">
              {img.image_url ? (
                <img src={img.image_url} alt={img.caption || ""} />
              ) : (
                <div className="gallery__placeholder" aria-hidden="true" />
              )}
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
