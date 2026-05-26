import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Company from "@/pages/Company";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Templates from "@/pages/Templates";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Blog from "@/pages/Blog";
import Portfolio from "@/pages/Portfolio";
import BlogDetail from "@/pages/BlogDetail";
import PortfolioDetail from "@/pages/PortfolioDetail";
import TemplateDetail from "@/pages/TemplateDetail";
import SpotterPolicy from "@/pages/SpotterPolicy";
import LegalPage from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import { LEGAL_PAGES } from "@/pages/legal-content";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="company" element={<Company />} />
        <Route path="careers" element={<Careers />} />
        <Route path="contact" element={<Contact />} />
        <Route path="templates" element={<Templates />} />
        <Route path="templates/cart" element={<Cart />} />
        <Route path="templates/checkout" element={<Checkout />} />
        <Route path="templates/:templateId" element={<TemplateDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="portfolio/:portfolioId" element={<PortfolioDetail />} />
        <Route path="spotter-policy" element={<SpotterPolicy />} />
        {LEGAL_PAGES.map((p) => (
          <Route key={p.slug} path={p.slug} element={<LegalPage slug={p.slug} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}