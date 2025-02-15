import { Badge } from "../../../components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import styles from "./upgrade.module.css"; // Assuming CSS module for styling

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  href: string;
  billing: string;
  paymentLink?: string;
}

const pricingList: PricingProps[] = [
  {
    title: "Free",
    popular: PopularPlanType.NO,
    price: 0,
    description: "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Get Started",
    benefitList: ["1 Team member", "2 GB Storage", "Upto 4 pages", "Community support", "lorem ipsum dolor"],
    href: "/account/login",
    billing: "/month",
  },
  {
    title: "Premium",
    popular: PopularPlanType.YES,
    price: 10,
    description: "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Buy Now",
    benefitList: ["4 Team member", "4 GB Storage", "Upto 6 pages", "Priority support", "lorem ipsum dolor"],
    href: "/account/login",
    paymentLink: process.env.STRIPE_MONTHLY_PLAN_LINK,
    billing: "/month",
  },
  {
    title: "Enterprise",
    popular: PopularPlanType.NO,
    price: 99,
    description: "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Buy Now",
    benefitList: ["10 Team member", "8 GB Storage", "Upto 10 pages", "Priority support", "lorem ipsum dolor"],
    href: "/account/login",
    paymentLink: process.env.STRIPE_YEARLY_PLAN_LINK,
    billing: "/year",
  },
];

export default function Upgrade() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Get
        <span className={styles.gradientText}> Unlimited </span>
        Access
      </h2>
      <h3 className={styles.subtitle}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque eius optio nam. Delectus stecto !
      </h3>
      <div className={styles.grid}>
        {pricingList.map((pricing) => (
          <div key={pricing.title} className={`${styles.card} ${pricing.popular === PopularPlanType.YES ? styles.cardShadow : ""}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                {pricing.title}
                {pricing.popular === PopularPlanType.YES && (
                  <Badge variant="secondary" className={styles.badge}>
                    Most popular
                  </Badge>
                )}
              </div>
              <div>
                <span className={styles.price}>${pricing.price}</span>
                <span className='text-muted-foreground'> {pricing.billing}</span>
              </div>
              <div className={styles.description}>{pricing.description}</div>
            </div>

            <div className={styles.cardContent}>
              <Link
                href={pricing.href}
                className={styles.button}
                // onClick={() => {
                //   if (pricing.paymentLink) {
                //     localStorage.setItem("stripePaymentLink", pricing.paymentLink);
                //   }
                // }}
              >
                {pricing.buttonText}
              </Link>
            </div>

            <hr className='w-4/5 m-auto mb-4' />

            <div className={styles.cardFooter}>
              <div className='space-y-4'>
                {pricing.benefitList.map((benefit) => (
                  <div key={benefit} className={styles.benefitItem}>
                    <Check className={styles.benefitIcon} /> <h3>{benefit}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
