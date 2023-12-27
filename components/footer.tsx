"use client";

/*
|--------------------------------------------------------------------------
| フッター
|--------------------------------------------------------------------------
*/
const Footer = () => {
  return (
    <footer className="w-full bg-[#f8f8f8]">
      <div className="p-4 border-t flex flex-col-reverse md:flex-row justify-between items-center">
        <div className="md:w-2/5 mt-8 md:mt-0 tracking-widest cursor-default">
          &copy;
          {new Date().getFullYear()}
          <span className="ml-2">LIX</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
