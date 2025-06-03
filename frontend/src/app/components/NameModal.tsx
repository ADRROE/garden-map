import { useTranslations } from 'next-intl';
import React, {useState} from 'react'

type NameModalProps = {
    onPlacement: (inputName: string) => void;
    onAbort: () => void;
}


const NameModal: React.FC<NameModalProps> = ({ onPlacement, onAbort }) => {

    const [inputName, setInputName] = useState("");
    const t = useTranslations('NameModal');

    return (
        <div className="bg-background text-foreground fixed inset-0 z-50 flex items-center justify-center rounded mb-1">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-md bg-opacity-50"
                onClick={onAbort}
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-white shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in border-2">
                <h2 className="text-lg font-sans font-semibold mb-4">{t('name')}</h2>
                <input
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-4 py-2 border bg-amber-50 border-black mb-4" />
                <div className="flex justify-start space-x-2">
                    <button
                        onClick={() => onPlacement(inputName)}
                        className="px-4 py-2 border w-full hover:bg-[#C5D4BC]"
                    >
                        {t('place')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NameModal;