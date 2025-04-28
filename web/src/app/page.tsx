'use client';
import type { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import "@/styles/pages/homepage.css";
import Autoplay from 'embla-carousel-autoplay';

const Home: NextPage = () => {

  return (
    <div className="text-center font-sans">
      <section className="fullscreen-carousel">
        <Carousel
          className="featured-carousel h-screen w-full"
          plugins={[
            Autoplay({
              delay: 6000,
            })
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            <CarouselItem>
              <div className="carousel-slide relative h-screen w-full">
                <Image
                  src="/images/Capitol1.jpg"
                  alt="White House Photo"
                  fill
                  style={{objectFit: "cover"}}
                  priority
                />
                <div className="caption-overlay absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white p-8">
                  <h1 className="text-5xl font-bold mb-4">Candidate Insight</h1>
                  <p className="text-xl mb-8">Compare stances on major issues like medicare, gun control, and healthcare.</p>
                  <Button className="explore-button bg-[#1c1c84] hover:bg-blue-700 text-lg py-2 px-6">
                    <Link href="/candidates">Explore Candidates</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
            
            <CarouselItem>
              <div className="carousel-slide relative h-screen w-full">
                <Image
                  src="/images/Skyline1.jpg"
                  alt="Skyline Photo"
                  fill
                  style={{objectFit: "cover"}}
                  loading="lazy"
                />
                <div className="caption-overlay absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white p-8">
                  <h2 className="text-4xl font-bold mb-4">Background Info</h2>
                  <p className="text-xl mb-8">Get to know candidates and explore their policies.</p>
                  <Button className="explore-button bg-[#1c1c84] hover:bg-blue-700 text-lg py-2 px-6">
                    <Link href="/candidates">Explore Candidates</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
            
            <CarouselItem>
              <div className="carousel-slide relative h-screen w-full">
                <Image
                  src="/images/LincolnMemorial1.jpg"
                  alt="Lincoln Memorial Photo"
                  fill
                  style={{objectFit: "cover"}}
                  loading="lazy"
                />
                <div className="caption-overlay absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white p-8">
                  <h2 className="text-4xl font-bold mb-4">Data-driven Insights</h2>
                  <p className="text-xl mb-8">Make informed decisions with factual information on key political issues.</p>
                  <Button className="explore-button bg-[#1c1c84] hover:bg-blue-700 text-lg py-2 px-6">
                    <Link href="/candidates">Explore Candidates</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
            
            <CarouselItem>
              <div className="carousel-slide relative h-screen w-full">
                <Image
                  src="/images/WhiteHouse2.jpg"
                  alt="Capitol Photo"
                  fill
                  style={{objectFit: "cover"}}
                  loading="lazy"
                />
                <div className="caption-overlay absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white p-8">
                  <h2 className="text-4xl font-bold mb-4">Neutral Analysis</h2>
                  <p className="text-xl mb-8">Gain knowledge about candidates and political issues with minimal bias.</p>
                  <Button className="explore-button bg-[#1c1c84] hover:bg-blue-700 text-lg py-2 px-6">
                    <Link href="/candidates">Explore Candidates</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="carousel-nav absolute left-4 z-10" />
          <CarouselNext className="carousel-nav absolute right-4 z-10" />
        </Carousel>
      </section>
    </div>
  );
};

export default Home;