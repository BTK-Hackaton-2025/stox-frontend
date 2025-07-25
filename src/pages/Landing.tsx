import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingCube from "@/components/floating-cube";
import { FileUpload } from "@/components/ui/file-upload";
import { CardDemo } from "@/components/ui/animated-card";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { PinContainer } from "@/components/ui/3d-pin";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { cn } from "@/lib/utils";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Stox" className="h-12 w-auto" />
                <span className="text-xl font-semibold">stox</span>
              </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/products/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered Marketplace
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Sell everywhere with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    one click
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload a photo, let AI polish it and generate SEO copy, then publish to Amazon, Trendyol, and Hepsiburada instantly. 
                  The future of marketplace selling is here.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products/new">
                                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" size="xl">
                    Start Selling Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    View Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">90s</div>
                  <div className="text-sm text-muted-foreground">Upload to Live</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Marketplaces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">AI Generated</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary/20 rounded-3xl blur-3xl"></div>
              <FloatingCube />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 border-t bg-white dark:bg-black">
        {/* Dot Background Pattern */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
          )}
        />
        {/* Radial gradient for faded look */}
        <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <FileUpload />
        </div>
          <div className="flex flex-col md:flex-row gap-20 justify-center items-center">
            <div className="flex flex-col items-center justify-center">
            <CardContainer className="inter-var justify-center items-center h-100% ">
              <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[24rem] h-auto rounded-xl p-4 border  ">
              <CardItem
                  translateZ="100"
                  rotateX={20}
                  rotateZ={-10}
                  className="w-full mt-4"
                >
                  <img src="/image.png" alt="After" />
                </CardItem>
                <CardItem
                  translateZ="50"
                  className="dark:text-white text-black text-lg font-bold leading-snug tracking-wide"
                >
                  <TextGenerateEffect words="Automatically generated title." />
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="max-w-xs dark:text-white text-black text-lg leading-snug tracking-wide"
                >
                  <TextGenerateEffect words="Automatically generated description & SEO keywords." />
                </CardItem>

                <div className="flex justify-between items-center mt-12">
                  <CardItem
                    translateZ={20}
                    translateX={-40}
                    as="button"
                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                  >
                    Try now →
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    translateX={40}
                    as="button"
                    className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                  >
                    Sign up
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-center mt-10 mx-auto relative z-20 bg-white dark:bg-black py-10 rounded-3xl">
            <PinContainer
              title="View product"
              href="#"
              containerClassName="mx-auto"
              className="w-[18rem]"
            >
              <BackgroundGradient className="rounded-3xl overflow-hidden w-full">
                <div className="flex flex-col gap-4 p-6 w-full">
                  <img
                    src="/image.png"
                    alt="Air Jordan 4 Retro Reimagined"
                    className="w-full h-auto rounded-xl object-contain"
                  />

                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-tight text-black">
                      Air Jordan 4 Retro Reimagined
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                      The Air Jordan 4 Retro Reimagined Bred will release on Saturday,
                      February 17, 2024. Your best opportunity to get these right now is
                      by entering raffles and waiting for the official releases.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button size="sm" className="px-4 py-2 bg-orange-600 hover:bg-orange-700">
                      Buy now
                    </Button>
                    <span className="rounded-md bg-zinc-700 px-3 py-1 text-xs font-medium text-white">
                      $100
                    </span>
                  </div>
                </div>
              </BackgroundGradient>
            </PinContainer>

            <PinContainer
              title="View product"
              href="#"
              containerClassName="mx-auto"
              className="w-[18rem]"
            >
              <BackgroundGradient className="rounded-3xl overflow-hidden w-full">
                <div className="flex flex-col gap-4 p-6 w-full">
                  <img
                    src="/image.png"
                    alt="Air Jordan 4 Retro Reimagined"
                    className="w-full h-auto rounded-xl object-contain"
                  />

                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-tight text-black">
                      Air Jordan 4 Retro Reimagined
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                      The Air Jordan 4 Retro Reimagined Bred will release on Saturday,
                      February 17, 2024. Your best opportunity to get these right now is
                      by entering raffles and waiting for the official releases.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button size="sm" className="px-4 py-2 bg-orange-600 hover:bg-orange-700">
                      Buy now
                    </Button>
                    <span className="rounded-md bg-zinc-700 px-3 py-1 text-xs font-medium text-white">
                      $100
                    </span>
                  </div>
                </div>
              </BackgroundGradient>
            </PinContainer>

            <PinContainer
              title="View product"
              href="#"
              containerClassName="mx-auto"
              className="w-[18rem]"
            >
              <BackgroundGradient className="rounded-3xl overflow-hidden w-full">
                <div className="flex flex-col gap-4 p-6 w-full">
                  <img
                    src="/image.png"
                    alt="Air Jordan 4 Retro Reimagined"
                    className="w-full h-auto rounded-xl object-contain"
                  />

                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-tight text-black">
                      Air Jordan 4 Retro Reimagined
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                      The Air Jordan 4 Retro Reimagined Bred will release on Saturday,
                      February 17, 2024. Your best opportunity to get these right now is
                      by entering raffles and waiting for the official releases.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button size="sm" className="px-4 py-2 bg-orange-600 hover:bg-orange-700">
                      Buy now
                    </Button>
                    <span className="rounded-md bg-zinc-700 px-3 py-1 text-xs font-medium text-white">
                      $100
                    </span>
                  </div>
                </div>
              </BackgroundGradient>
            </PinContainer>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Ready to revolutionize your selling?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of sellers who've already made the switch to intelligent marketplace management.
            </p>
            <Link to="/products/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="xl">
                Start Your First Listing
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-accent/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Stox" className="h-8 w-auto" />
                <span className="font-semibold">Stox</span>
              </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Stox. The future of marketplace selling.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;