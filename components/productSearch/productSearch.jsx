import React from "react";
import { useState } from "react";
const ProductSearch = ({
  filterTitle,
  setShowFilter,
  showFilter,
  setShowSearch,
  showSearch,
  handleFilterChange,
}) => {
  return (
    <nav className="w-full z-30 px-6 py-1  mt-8 relative">
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between">
        {/* 標題 */}
        <div className="font-bold text-xl">{filterTitle}</div>

        {/* 搜尋和篩選部分 */}
        <div className="flex items-center space-x-4">
          {/* 篩選圖標 */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24}>
                <path d="M7 11H17V13H7zM4 7H20V9H4zM10 15H14V17H10z" />
              </svg>
            </button>

            {/* 篩選下拉選單 */}
            {showFilter && (
              <div className="absolute top-10 left-0 mt-15 bg-white shadow-lg rounded-lg p-4 w-48 z-50">
                <ul className="space-y-2">
                  <li
                    className="hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleFilterChange("default")}
                  >
                    依照預設
                  </li>
                  <li
                    className="hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleFilterChange("popular")}
                  >
                    依照熱門程度
                  </li>
                  <li
                    className="hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleFilterChange("priceHigh")}
                  >
                    依照價錢由高到低
                  </li>
                  <li
                    className="hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleFilterChange("priceLow")}
                  >
                    依照價錢由低到高
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* 搜尋圖標和搜尋欄 */}
          <div className="relative flex items-center">
            <button
              className="pl-3 inline-block no-underline hover:text-black"
              onClick={() => {
                setShowSearch(!showSearch);
                console.log("ShowSearch status:", showSearch); // 用來檢查狀態是否成功切換
              }}
            >
              <svg
                className="fill-current hover:text-black"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z" />
              </svg>
            </button>
            {showSearch && (
              <div className="ml-2">
                <input
                  type="text"
                  className="border rounded-full py-1 px-4 text-sm z-50"
                  placeholder="搜尋"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ProductSearch;
