"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import BasketImg from "@/public/images/about/fix/basket.png";
import ShoesImg from "@/public/images/about/fix/shoes.png";
import GreenCardImg from "@/public/images/about/fix/green-card.png";
import YellowPolygonImg from "@/public/images/about/fix/yellow-polygon.png";
import BasketRingImg from "@/public/images/about/fix/Basket ring.png";
import AlertImg from "@/public/images/about/fix/alert.png";
import GetToKnowImg from "@/public/images/about/fix/get-to-know.png";
import IblImg from "@/public/images/about/fix/ibl.png";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";

const aboutText =
  "ITS Basketball League 2026 (IBL2K26) merupakan kompetisi bola basket antar Himpunan Mahasiswa Departemen (HMD) yang menjadi salah satu agenda olahraga tahunan terbesar di Institut Teknologi Sepuluh Nopember, yang diselenggarakan oleh UKM Basket ITS. IBL2K26 tidak hanya menjadi wadah pengembangan bakat basket, tetapi juga sarana membangun karakter, solidaritas, serta sportivitas dalam persaingan yang kompetitif dan berintegritas.";

export const AboutSection = () => {
  return (
    <section
      className="relative w-full max-w-[1440px] mx-auto select-none"
      style={{
        aspectRatio: "1440 / 1280",
        marginTop: "var(--about-top-shift, 0px)",
      }}
    >
      <h2 className="sr-only">Get To Know IBL</h2>

      {/* 
        Container with desktop top shift to balance spacing below navbar.
        On mobile (< 768px), it remains at normal natural positioning.
      */}
      <div className="absolute inset-0 md:-translate-y-[calc(100%*38/1280)]">
        {/* 
          1. Main Paper Backdrop (about-paper.svg)
          - w: 1611px, h: 885px, left: -88px, top: 280px
          - Full natural size (uncompressed)
          - z-index: 10 (Lowest - Pops in 1st)
        */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={popSpringVariants}
          custom={0.05}
          className="absolute pointer-events-none z-10"
          style={{
            width: "calc(100% * 1611 / 1440)",
            height: "calc(100% * 885 / 1280)",
            left: "calc(100% * -88 / 1440)",
            top: "calc(100% * 280 / 1280)",
          }}
        >
          <Image
            src="/images/about/about-paper.svg"
            alt="About Paper Backdrop"
            fill
            priority
            className="object-contain"
          />
        </motion.div>

        {/* 
          ASSETS: Enlarged on desktop (md:scale-[1.12]) while retaining original mobile size
        */}

        {/* 
          3. Yellow Polygon (yellow-polygon.png)
          - w: 210.26px, h: 199.18px, top: 159px, left: 154px
          - z-index: 20 (Pops in 3rd + FLOATING ANIMATION)
        */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={popPunchVariants}
          custom={{ delay: 0.28, rotation: -4 }}
          className="absolute pointer-events-none z-20 md:scale-[1.12] md:origin-center"
          style={{
            width: "calc(100% * 210.26 / 1440)",
            left: "calc(100% * 154 / 1440)",
            top: "calc(100% * 159 / 1280)",
          }}
        >
          <motion.div
            animate={{ y: [-8, 6, -8], rotate: [-4, 4, -4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-auto"
          >
            <Image
              src={YellowPolygonImg}
              alt="Yellow Polygon"
              className="w-full h-auto"
            />
          </motion.div>
        </motion.div>

        {/* 
          4. Basket Ring (Basket ring.png)
          - top: 159px, right: 116.99px
          - z-index: 20 (Pops in 4th + FLOATING ANIMATION)
        */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={popPunchVariants}
          custom={{ delay: 0.34, rotation: 3 }}
          className="absolute pointer-events-none z-20 md:scale-[1.12] md:origin-center"
          style={{
            width: "calc(100% * 146.5 / 1440)",
            right: "calc(100% * 116.99 / 1440)",
            top: "calc(100% * 159 / 1280)",
          }}
        >
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 5.0, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-auto"
          >
            <Image
              src={BasketRingImg}
              alt="Basket Ring"
              className="w-full h-auto"
            />
          </motion.div>
        </motion.div>

        {/* 
          5. Alert Exclamation (alert.png)
          - top: 309px, right: 251.21px
          - z-index: 20 (Pops in 5th + FLOATING ANIMATION)
        */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={popPunchVariants}
          custom={{ delay: 0.40, rotation: -3 }}
          className="absolute pointer-events-none z-20 md:scale-[1.12] md:origin-center"
          style={{
            width: "calc(100% * 152.5 / 1440)",
            right: "calc(100% * 251.21 / 1440)",
            top: "calc(100% * 309 / 1280)",
          }}
        >
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-auto"
          >
            <Image
              src={AlertImg}
              alt="Alert"
              className="w-full h-auto"
            />
          </motion.div>
        </motion.div>

        {/* 
          CONTENT ISI: Kept at exact 0.75 scaling on desktop without pushing down.
          (Green Card, GET TO KNOW title, IBL letters, and description text)
        */}
        <div className="absolute inset-0 z-20 md:scale-[0.75] md:origin-[center_280px]">
          {/* 
            2. Green Card Banner (green-card.png)
            - top: 217px, left: 294px, width: 852px
            - z-index: 15 (Pops in 2nd, on top of paper)
          */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={popSpringVariants}
            custom={0.18}
            className="absolute pointer-events-none z-15"
            style={{
              width: "calc(100% * 855 / 1440)",
              left: "calc(100% * 294 / 1440)",
              top: "calc(100% * 217 / 1280)",
            }}
          >
            <Image
              src={GreenCardImg}
              alt="Green Card Banner"
              priority
              className="w-full h-auto"
            />
          </motion.div>

          {/* 
            6. Title: GET TO KNOW Banner
            - top: 280px, left: 382px, width: 676px
            - z-index: 20 (Pops in 6th)
          */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={popSpringVariants}
            custom={0.46}
            className="absolute pointer-events-none z-20"
            style={{
              width: "calc(100% * 676 / 1440)",
              left: "calc(100% * 382 / 1440)",
              top: "calc(100% * 280 / 1280)",
            }}
          >
            <Image
              src={GetToKnowImg}
              alt="GET TO KNOW"
              priority
              className="w-full h-auto"
            />
          </motion.div>

          {/* 
            7. Title: IBL Letters
            - Positioned overlapping bottom center of GET TO KNOW banner
            - z-index: 20 (Pops in 7th)
          */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={popPunchVariants}
            custom={{ delay: 0.52, rotation: 2 }}
            className="absolute pointer-events-none z-20"
            style={{
              width: "calc(100% * 295 / 1440)",
              left: "calc(100% * 572.5 / 1440)",
              top: "calc(100% * 385 / 1280)",
            }}
          >
            <Image
              src={IblImg}
              alt="IBL"
              priority
              className="w-full h-auto"
            />
          </motion.div>

          {/* 
            8. Description Text (Inside paper)
            - w: 1044px, h: 579px, top: 479px, centered horizontally
            - font: var(--font-drowner)
            - z-index: 20 (Pops in 8th)
          */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={popSpringVariants}
            custom={0.58}
            className="absolute z-20 text-center md:text-justify flex items-center justify-center -translate-x-1/2 left-1/2"
            style={{
              width: "calc(100% * 1044 / 1440)",
              height: "calc(100% * 579 / 1280)",
              top: "calc(100% * 479 / 1280)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-drowner)",
                fontSize: "clamp(8px, calc(100vw * 32 / 1440), 32px)",
              }}
              className="text-[#070503] font-bold leading-[1.6] tracking-[0.113em]"
            >
              {aboutText}
            </p>
          </motion.div>
        </div>

        {/* 
          9. Basketball (Left bleeding) - Enlarged on desktop (md:scale-[1.12]), anchored to left edge
          - exact: 290px x 289.29px, top: 860px, left: -58px
          - z-index: 30 (Highest tier - Pops in 9th + FLOATING ANIMATION)
        */}
        <div
          className="absolute pointer-events-none z-30 md:scale-[1.12] md:origin-left"
          style={{
            width: "calc(100% * 290 / 1440)",
            height: "calc(100% * 289.29 / 1280)",
            left: "calc(100% * -58 / 1440)",
            top: "calc(100% * 860 / 1280)",
          }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={popPunchVariants}
            custom={{ delay: 0.66, rotation: -6 }}
            className="w-full h-full"
          >
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [-4, 3, -4] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <Image
                src={BasketImg}
                alt="Basketball"
                priority
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* 
          10. Shoes (Right bleeding) - Enlarged on desktop (md:scale-[1.12]), anchored to right edge
          - exact: 502px x 335.14px, top: 933px, right: -80px
          - z-index: 30 (Highest tier - Pops in 10th + FLOATING ANIMATION)
        */}
        <div
          className="absolute pointer-events-none z-30 md:scale-[1.12] md:origin-right"
          style={{
            width: "calc(100% * 502 / 1440)",
            height: "calc(100% * 335.14 / 1280)",
            right: "calc(100% * -80 / 1440)",
            top: "calc(100% * 933 / 1280)",
          }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={popPunchVariants}
            custom={{ delay: 0.72, rotation: 4 }}
            className="w-full h-full"
          >
            <motion.div
              animate={{ y: [-7, 7, -7], rotate: [-3, 3, -3] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <Image
                src={ShoesImg}
                alt="Basketball Shoes"
                priority
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
