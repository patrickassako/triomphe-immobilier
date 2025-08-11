import { Layout } from '@/components/public'
import { HeroSection } from '@/components/public/HeroSection'
import { FeaturedProperties } from '@/components/public/FeaturedProperties'
import { ServicesSection } from '@/components/public/ServicesSection'
import { NewsletterSection } from '@/components/public/NewsletterSection'

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProperties />
      <ServicesSection />
      <NewsletterSection />
    </Layout>
  );
}