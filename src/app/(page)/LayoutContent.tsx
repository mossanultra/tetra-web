import Footer from "@/src/components/layouts/Footer/footer";
import Header from "@/src/components/layouts/Header/header";
import React from "react";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  // const { user, loading } = useUser();

  // if (loading) {
  //   return (
  //     <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 z-[9999] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900">
  //       <div className="text-center text-white">
  //         <div className="relative w-15 h-15 mx-auto mb-5 md:w-12 md:h-12">
  //           <div className="absolute border-3 border-white/30 rounded-full w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
  //           <div className="absolute border-3 border-white/30 rounded-full w-full h-full animate-[pulse_2s_ease-in-out_infinite] [animation-delay:-1s]"></div>
  //         </div>
  //         <div className="text-lg font-light tracking-wide opacity-90 md:text-base">
  //           読み込み中...
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return (
  //     <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 z-[9999] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900">
  //       <div className="text-center text-white">
  //         <div className="relative w-15 h-15 mx-auto mb-5 md:w-12 md:h-12">
  //           <div className="absolute border-3 border-white/30 rounded-full w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
  //           <div className="absolute border-3 border-white/30 rounded-full w-full h-full animate-[pulse_2s_ease-in-out_infinite] [animation-delay:-1s]"></div>
  //         </div>
  //         <div className="text-lg font-light tracking-wide opacity-90 md:text-base">
  //           ユーザー情報を確認中...
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 relative md:overflow-hidden">
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </div>
  );
};

export default LayoutContent;
