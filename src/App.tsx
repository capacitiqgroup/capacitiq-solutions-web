import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { CookieBanner, applyStoredConsent } from "@/components/CookieBanner";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Company from "@/pages/Company";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Templates from "@/pages/Templates";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import ThankYou from "@/pages/ThankYou";

import Blog from "@/pages/Blog";
import Portfolio from "@/pages/Portfolio";
import BlogDetail from "@/pages/BlogDetail";
import PortfolioDetail from "@/pages/PortfolioDetail";
import TemplateDetail from "@/pages/TemplateDetail";
import SpotterPolicy from "@/pages/SpotterPolicy";
import LegalPage from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import { LEGAL_PAGES } from "@/pages/legal-content";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminTemplates from "@/pages/admin/AdminTemplates";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminOrders from "@/pages/admin/AdminOrders";

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
      });
    }
  }, [location]);
}

export default function App() {
  usePageTracking();
  useEffect(() => { applyStoredConsent(); }, []);

  return (
    <>
      <Routes>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminTemplates />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="company" element={<Company />} />
          <Route path="careers" element={<Careers />} />
          <Route path="contact" element={<Contact />} />
          <Route path="templates" element={<Templates />} />
          <Route path="templates/cart" element={<Cart />} />
          <Route path="templates/checkout" element={<Checkout />} />
          <Route path="templates/thank-you" element={<ThankYou />} />

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
      <CookieBanner />
    </>
  );
}
