import { Zap, GitBranch, CheckCircle } from "lucide-react";
import React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Simple Synchronization",
    description: "Sync your Markdown files to Notion with a single command. No complex setup, no manual copying - just seamless integration between your local docs and Notion workspace.",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: GitBranch,
    title: "Maintain Your Workflow",
    description: "Keep writing in your favorite Markdown editor and version control your docs with Git. Mk Notes handles the Notion synchronization automatically.",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: CheckCircle,
    title: "Preserve Formatting",
    description: "Your Markdown formatting is perfectly preserved in Notion, including code blocks, tables, images, and more. What you write is what you get.",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Why Choose Mk Notes?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The perfect bridge between your local Markdown workflow and Notion&apos;s collaborative features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} mb-6`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ready to experience the power of seamless Markdown to Notion synchronization?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
            >
              <Link href="/docs"> View Documentation </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
