export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__row">
        <p>&copy; {new Date().getFullYear()} Morad Yousuf Behbehani — General Trading Division</p>
        <nav aria-label="Footer links">
          <a href="/it-support">IT Support</a>
          <a href="/handbook">Handbook</a>
          <a href="/feedback">Feedback</a>
        </nav>
      </div>
    </footer>
  );
}
