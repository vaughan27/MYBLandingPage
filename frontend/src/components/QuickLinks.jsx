import { useContent } from "../hooks/useContent";
import { FALLBACK_QUICK_LINKS } from "../config/fallbackContent";
import Icon from "./Icon";

// export default function QuickLinks() {
//   const { data: links } = useContent("quick-links", FALLBACK_QUICK_LINKS);

//   return (
//     <section className="quick-links">
//       <div className="container quick-links__row">
//         {links.map((link) => (
//           <a key={link.id} href={link.href} className="quick-links__item">
//             <Icon name={link.icon} size={18} />
//             {link.label}
//           </a>
//         ))}
//       </div>
//     </section>
//   );
// }

export default function QuickLinks() {
  const { data: links } = useContent("quick-links", FALLBACK_QUICK_LINKS);
  // console.log(links);

  return (
    <section className="quick-links">
      <div className="container">
        <h2 className="section-heading">Company systems</h2>

        <div className="feature-tiles__grid">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              className="feature-tiles__card"
              style={{ backgroundImage: `url(${link.img_url})` }}
            >
              <Icon
                name={link.icon}
                size={26}
                className="feature-tiles__icon"
              />

              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
