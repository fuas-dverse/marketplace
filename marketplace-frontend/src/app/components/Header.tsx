import Link from "next/link";

const Header = () => {
  return (
    <header>
      <h1>Marketplace</h1>
      <nav>
        <Link href="/">Home</Link>
      </nav>
    </header>
  );
};

export default Header;
