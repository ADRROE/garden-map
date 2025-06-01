
import React from 'react'

type UpdateModalProps = {
    onEditConfirm: (operation: 'create' | 'modify') => void;
    onEditAbort: () => void;
}


const UpdateModal: React.FC<UpdateModalProps> = ({ onEditConfirm, onEditAbort }) => {


    return (
        <div className="bg-background text-foreground fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-md bg-opacity-50"
                onClick={onEditAbort}
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-white shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in border-2">
                <h2 className="text-lg font-sans font-semibold mb-4">Change confirmation</h2>
                <div className="flex justify-start space-x-2">
                    <button
                        onClick={() => onEditConfirm('create')}
                        className="px-4 py-2 border w-full hover:bg-[#C5D4BC]"
                    >
                        New record
                    </button>
                    <button
                        onClick={() => onEditConfirm('modify')}
                        className="px-4 py-2 border w-full hover:bg-[#C5D4BC]"
                    >
                        Correction
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UpdateModal;