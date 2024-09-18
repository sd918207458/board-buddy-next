import React from "react";
import Navbar from "@/components/navbar_login";
import Footer from "@/components/footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { motion } from "framer-motion";
import card_data from "../../components/UI.json/card_data.json";

const cardData = card_data;

// 統一色系的卡片組件
const Card = ({ title, description, href, image }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="card bg-[#036672] text-white shadow-lg hover:shadow-2xl transition-shadow w-full md:w-80 lg:w-96 cursor-pointer"
  >
    <Link href={href} passHref>
      <div className="card-body flex flex-row items-center">
        <div className="avatar">
          <div className="w-24 rounded-full ring ring-white ring-offset-base-100 ring-offset-2">
            <img src={image} alt="Avatar" />
          </div>
        </div>
        <div className="ml-4">
          <h2 className="card-title text-lg text-white">{title}</h2>
          <p className="text-sm text-gray-200">{description}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function MemberAccount() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#003E52] dark:bg-gray-900">
        <div className="w-full max-w-sm mx-auto overflow-hidden bg-[#003E52] rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
          <div className="relative flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="w-full max-w-sm mx-auto lg:max-w-4xl mb-4 absolute left-0 top-0">
              <Breadcrumbs />
            </div>

            {/* 第一行卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
              {cardData.slice(0, 2).map((item, index) => (
                <Card key={index} {...item} />
              ))}
            </div>

            {/* 第二行卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
              {cardData.slice(2, 4).map((item, index) => (
                <Card key={index} {...item} />
              ))}
            </div>

            {/* 第三行卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
              {cardData.slice(4).map((item, index) => (
                <Card key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
