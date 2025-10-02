import { CheckCircle } from "lucide-react";
import React from "react";

const benefits = [
  {
    title: "For Developers",
    description: "Perfect for developers who want to maintain their Markdown workflow while leveraging Notion's collaboration features.",
    features: [
      "Write documentation in your favorite Markdown editor",
      "Version control your docs with Git",
      "Automate synchronization with CI/CD pipelines",
      "Maintain code-first documentation approach",
    ],
    icon: "👨‍💻",
  },
  {
    title: "For Teams",
    description: "Enable seamless collaboration between technical and non-technical team members.",
    features: [
      "Collaborate in Notion while maintaining source control",
      "Keep documentation in sync across platforms",
      "Maintain consistency with automated formatting",
      "Enable non-technical team members to contribute",
    ],
    icon: "👥",
  },
];


export function Benefits() {
  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Perfect for Teams and Individuals
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Whether you&apos;re a solo developer or part of a large team, Mk Notes adapts to your needs.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <span className="text-4xl mr-4">{benefit.icon}</span>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {benefit.description}
              </p>
              
              <ul className="space-y-3">
                {benefit.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckCircle className="mr-3 mt-1 h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
