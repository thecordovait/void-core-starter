
import React from 'react';
import Layout from '../components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome to Your Project</h1>
            <p className="text-lg text-gray-600 mb-8">
              This is a clean starting point for your new project.
              Build something amazing!
            </p>
            <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">Feature {item}</h3>
                <p className="text-gray-600">
                  A brief description of this feature and how it can help your users.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
