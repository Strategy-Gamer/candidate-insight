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
import CapitolPhoto from '../../../photos/Homepage/Capitol1.jpg';
import WhiteHousePhoto from '../../../photos/Homepage/WhiteHouse2.jpg';
import SkylinePhoto from '../../../photos/Homepage/Skyline1.jpg';
import LincolnPhoto from '../../../photos/Homepage/LincolnMemorial1.jpg';


const Home: NextPage = () => {
  return (
    <div className="text-center font-sans">
      {/* <section className="hero">
        <h1>Candidate Insight</h1>
        <h2>Understand Policy Positions & Compare Candidates</h2>
        <Button className="explore-button">
          <Link href="/candidates">Explore Candidates</Link>
        </Button>
      </section> */}

      <section className="carousel-section">
        <Carousel 
          className="featured-carousel"
          plugins={[
            Autoplay({
              delay: 5000,
            })
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            <CarouselItem>
              <div className="carousel-slide">
                <h3>Policy Comparison</h3>
                <p>Compare stances on major issues like medicare, gun control, and healthcare.</p> 
                <div className="image-container">
                  <Image
                    src={WhiteHousePhoto}
                    alt={`White House Photo`}
                    style={{width: "100%", height: "100%"}}
                    loading="lazy"
                  />
                </div>
              </div> 
            </CarouselItem>
            <CarouselItem>
              <div className="carousel-slide">
                <Image
                  src={SkylinePhoto}
                  alt={`Skyline Photo`}
                  style={{width: "auto", height: "auto"}}
                  loading="lazy"
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="carousel-slide">
                <Image
                  src={LincolnPhoto}
                  alt={`Lincoln Memorial Photo`}
                  style={{width: "auto", height: "auto"}}
                  loading="lazy"
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="carousel-slide">
                <Image
                  src={CapitolPhoto}
                  alt={`Capitol Photo`}
                  style={{width: "auto", height: "auto"}}
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="carousel-nav" />
          <CarouselNext className="carousel-nav" />
        </Carousel>
      </section>

      {/* <section className="features">
        <div className="feature-box">
          <h3>Policy Comparison</h3>
          <p>Compare stances on major issues like medicare, gun control, and healthcare.</p>
        </div>
        <div className="feature-box">
          <h3>Background Info</h3>
          <p>Get to know candidates and explore their policies.</p>
        </div>
        <div className="feature-box">
          <h3>Data-driven Insights</h3>
          <p>Make informed decisions with data-driven insights on candidates.</p>
        </div>
        <div className="feature-box">
          <h3>Neutral Analysis</h3>
          <p>Gain knowledge about candidates and political issues with as little bias as possible.</p>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
