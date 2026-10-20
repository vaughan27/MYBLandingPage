export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__row">
        <p>&copy; {new Date().getFullYear()} Morad Yousuf Behbehani </p>
        <nav aria-label="Footer links">
          <a href="http://192.0.15.99:8055/assets/5aa69f40-3e08-490d-8eab-c20f7d4116e5" 
          target="_blank">IT Support</a>
          <a href="/assets/pdfs/emp-handbook.pdf"
          target="_blank">Handbook</a>
          {/* <a href="/feedback">Feedback</a> */}
        </nav>
      </div>
    </footer>
  );
}
