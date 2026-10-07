export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__row">
        <p>&copy; {new Date().getFullYear()} Morad Yousuf Behbehani — General Trading Division</p>
        <nav aria-label="Footer links">
          <a href="http://192.0.15.99:8055/assets/5aa69f40-3e08-490d-8eab-c20f7d4116e5">IT Support</a>
          <a href="http://192.0.15.99:8055/assets/c629a334-8179-4444-a416-de32bac11fcb">Handbook</a>
          {/* <a href="/feedback">Feedback</a> */}
        </nav>
      </div>
    </footer>
  );
}
