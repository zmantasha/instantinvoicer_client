"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto py-12 px-6 text-center">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Create Professional Invoices Easily</h1>
        <p className="text-lg opacity-90 mb-6">
          Generate clean, well-structured invoices in seconds with our template.
        </p>
        <Link href="/account/login">
        <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-gray-100 transition">
          Get Started
        </button>
        </Link>
      </section>

      {/* Features Section */}
      {/* <section className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Easy to Use</h2>
          <p className="text-gray-600">Create invoices effortlessly with a simple UI.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Customizable</h2>
          <p className="text-gray-600">Add your logo, details, and tailor the template as needed.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Download as PDF</h2>
          <p className="text-gray-600">Easily download and share invoices in PDF format.</p>
        </div>
      </section> */}

      <section className="mt-12 grid md:grid-cols-3 gap-6">
  <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">Easy to Use</h2>
    <p className="text-gray-600">Create invoices effortlessly with a simple UI.</p>
  </div>
  <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">Customizable & Dynamic</h2>
    <p className="text-gray-600">Add dynamic item headers, paste Excel data, and apply GST calculations seamlessly.</p>
  </div>
  <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">Download & Share</h2>
    <p className="text-gray-600">Easily download invoices as PDFs or share via WhatsApp & email.</p>
  </div>
  <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">Live Updates</h2>
    <p className="text-gray-600">When you share an invoice, consumers see real-time updates.</p>
  </div>
  <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">Brand Personalization</h2>
    <p className="text-gray-600">Upload your logo to create a professional-looking invoice.</p>
  </div>
  <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">Payment Status & Watermark</h2>
    <p className="text-gray-600">If the consumer pays, a "Paid" watermark appears, and the balance updates to zero.</p>
  </div>
</section>


      {/* Blog Section */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Latest Blog Posts</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Blog 1 */}
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">How to Create a Professional Invoice</h3>
            <p className="text-gray-600 mb-4">
              Learn the key elements of a professional invoice and how to structure it.
            </p>
            <a href="#" className="text-blue-600 font-medium hover:underline">
              Read More →
            </a>
          </div>
          {/* Blog 2 */}
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">Top 5 Invoice Mistakes to Avoid</h3>
            <p className="text-gray-600 mb-4">
              Avoid common mistakes that can delay payments and frustrate clients.
            </p>
            <a href="#" className="text-blue-600 font-medium hover:underline">
              Read More →
            </a>
          </div>
          {/* Blog 3 */}
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">Why Digital Invoicing is the Future</h3>
            <p className="text-gray-600 mb-4">
              Discover the benefits of digital invoices and how they improve cash flow.
            </p>
            <a href="#" className="text-blue-600 font-medium hover:underline">
              Read More →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
