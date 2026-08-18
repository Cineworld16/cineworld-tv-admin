import icon from "@/assets/logo-icon.png";

interface LogoProps {
  variant?: "icon" | "full";
  className?: string;
  textClassName?: string;
}

export const Logo = ({
  variant = "full",
  className = "h-9",
  textClassName = "text-2xl",
}: LogoProps) => (
  <span className="inline-flex items-center gap-2.5">
    <img src={icon} alt="CineWorld Admin" className={`${className} w-auto`} />
    {variant === "full" && (
      <span
        className={`font-bold leading-none tracking-tight text-white ${textClassName}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        CineWorld <span className="text-gradient-fire">Admin</span>
      </span>
    )}
  </span>
);

export default Logo;
