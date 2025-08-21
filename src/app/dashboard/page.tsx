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

const tools = [
  {
    title: 'AI Product Listing Tool',
    description: 'Effortlessly create compelling product titles, descriptions, and hashtags for your crafts.',
    href: '/dashboard/product-listing',
    icon: <PackagePlus className="size-8 text-primary" />,
  },
  {
    title: 'AI Storytelling Tool',
    description: 'Convert your spoken stories into engaging cultural narratives for your audience.',
    href: '/dashboard/story-creation',
    icon: <Mic className="size-8 text-primary" />,
  },
  {
    title: 'Discover Crafts',
    description: 'Explore the rich history and cultural significance behind various artisanal crafts.',
    href: '/dashboard/discovery',
    icon: <Search className="size-8 text-primary" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Artisan!</h1>
        <p className="text-muted-foreground">
          Here are the tools to help you share your craft with the world.
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
                  Use Tool <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
