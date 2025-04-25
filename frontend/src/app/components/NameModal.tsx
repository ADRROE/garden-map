import React from 'react'

type NameModalProps = {
    inputName: string;
    onPlacement: () => void;
    onAbort: () => void;
    setInputName: (value: string) => void;
}


const NameModal: React.FC<NameModalProps> = ({ inputName, onPlacement, onAbort, setInputName }) => {
    return (
        <div className="bg-background text-foreground fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-md bg-opacity-50"
                onClick={onAbort}
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-white shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in border-2">
                <h2 className="text-lg font-sans font-semibold mb-4">Name</h2>
                <input
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-4 py-2 border bg-amber-50 border-black mb-4" />
                <div className="flex justify-start space-x-2">
                    <button
                        onClick={() => {
                            onPlacement();
                        }
                        }
                        className="px-4 py-2 border w-full hover:bg-[#C5D4BC]"
                    >
                        Place
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NameModal;