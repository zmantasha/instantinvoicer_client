// components/Button.tsx

"use client";

import Link from "next/link";
import styles from "./navbar.module.css"

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  href: string; // Link destination
}

const Button: React.FC<ButtonProps> = ({ children ,href,onClick}) => {
  return (
   <Link href={href} className={styles.buttonStyles} onClick={onClick}>
      {children}
      </Link>
  );
};




export default Button;
