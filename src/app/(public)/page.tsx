import { getFeaturedProducts, getOpenCohorts } from "@/actions";
import { Hero } from "@/components/public/home/hero";
import { FeaturedProducts } from "@/components/public/home/featured-products";
import { AboutTeaser } from "@/components/public/home/about-teaser";
import { AcademyTeaser } from "@/components/public/home/academy-teaser";
import { ClosingCta } from "@/components/public/home/closing-cta";

export default async function HomePage() {
  const [products, cohorts] = await Promise.all([
    getFeaturedProducts(8),
    getOpenCohorts(),
  ]);
  // const cohortsData = cohorts.map(el => ({id: el.id, title: el.title, price: +(el.price), startDate: el.startDate, endDate: el.endDate, status: el.status, modePolicy: el.modePolicy, _count: {enrolments: el._count.enrolments}}))
  const productsData = products.map(el => ({...el, price: +(el.price)}))
  const cohortsData = cohorts.map(el => ({...el, price: +(el.price)}))

  return (
    <>
      <Hero />
      <FeaturedProducts products={productsData} />
      <AboutTeaser />
      <AcademyTeaser cohorts={cohortsData} />
      <ClosingCta />
    </>
  );
}
