
'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PackagePlus, Mic, Search } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function DashboardPage() {
    const { translations } = useLanguage();

    const tools = [
        {
            title: translations.dashboard.tools.productListing.title,
            description: translations.dashboard.tools.productListing.description,
            href: '/dashboard/product-listing',
            icon: <PackagePlus className="size-8 text-primary" />,
        },
        {
            title: translations.dashboard.tools.storyCreation.title,
            description: translations.dashboard.tools.storyCreation.description,
            href: '/dashboard/story-creation',
            icon: <Mic className="size-8 text-primary" />,
        },
        {
            title: translations.dashboard.tools.discoverCrafts.title,
            description: translations.dashboard.tools.discoverCrafts.description,
            href: '/dashboard/discovery',
            icon: <Search className="size-8 text-primary" />,
        },
    ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{translations.dashboard.welcome}</h1>
        <p className="text-muted-foreground">
          {translations.dashboard.subheading}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.title} className="flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start gap-4">
                {tool.icon}
                <div className="flex-1">
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription className="mt-2">{tool.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full justify-end">
                <Link href={tool.href}>
                  {translations.dashboard.useTool} <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
