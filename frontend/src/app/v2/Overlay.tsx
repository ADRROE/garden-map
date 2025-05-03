
  
  export default function Overlay() {

    const btnClass =
    'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';


    
    return (
        <>
              {/* Left vertical buttons */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 space-y-4 z-50">
      <button className={btnClass}>
          <img src="/icons/tool1.png" alt="Tool 1" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/icons/tool2.png" alt="Tool 2" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/icons/tool3.png" alt="Tool 3" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/icons/tool4.png" alt="Tool 4" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/zone.png" alt="Zone" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/element.png" alt="Element" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img
            src='/icons/locked.png'
            alt="Lock"
            className="w-[70%]"
          />
        </button>
      </div>

      {/* Top center buttons */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-x-4 flex">
        <button className={btnClass}>
          <img src="/icons/top1.png" alt="Top 1" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/icons/top2.png" alt="Top 2" className="w-[70%]" />
        </button>
      </div>
        </>
    );
}