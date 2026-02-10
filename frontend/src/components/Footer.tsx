import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 px-4 text-center romantic-gradient">
      <p className="text-primary-foreground font-body flex items-center justify-center gap-1">
        Made with <Heart className="w-4 h-4 fill-current inline" /> by{" "}
        <a href="https://www.web-matrix.in" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity font-semibold">
          Web-Matrix
        </a>
      </p>
    </footer>
  );
};

export default Footer;
