import Link from "next/link";
import styles from "./footer.module.css";
import { FaFacebook, FaXTwitter, FaYoutube, FaLinkedin, FaGithub } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <h3>USE INVOICE GENERATOR</h3>
          <ul>
            <li><Link href="/account/login">Invoice Template</Link></li>
            <li><Link href="#">Credit Note Template</Link></li>
            <li><Link href="#">Quote Template</Link></li>
            <li><Link href="#">Purchase Order Template</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3>RESOURCES</h3>
          {/* <ul>
            <li><Link href="#">Invoicing Guide</Link></li>
            <li><Link href="#">Help</Link></li>
            <li><Link href="#">Sign In</Link></li>
            <li><Link href="#">Sign Up</Link></li>
            <li><Link href="#">Release Notes</Link></li>
            <li><Link href="#">Developer API</Link></li>
          </ul> */}
        </div>

        <div className={styles.column}>
        <Link href="/account/login"><p>© 2024-2025 instantinvoicer.com</p></Link>
          <div className={styles.socialIcons}>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaXTwitter />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
          </div>
          <ul className={styles.policyLinks}>
            <li><Link href="#">Terms of Service</Link></li>
            <li><Link href="#">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
