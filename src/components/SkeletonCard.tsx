import React from 'react';

const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/40 rounded-[16px] p-6 shadow-sm overflow-hidden flex flex-col min-h-[180px] animate-pulse">
            <div className="flex justify-between items-start mb-4 gap-4">
                <div className="h-6 bg-surface-variant dark:bg-[#2a2c2e] rounded-md w-2/3"></div>
                <div className="h-6 w-20 bg-surface-variant dark:bg-[#2a2c2e] rounded-full"></div>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-surface-variant dark:bg-[#2a2c2e] rounded-full"></div>
                    <div className="h-4 bg-surface-variant dark:bg-[#2a2c2e] rounded w-1/2"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-surface-variant dark:bg-[#2a2c2e] rounded-full"></div>
                    <div className="h-4 bg-surface-variant dark:bg-[#2a2c2e] rounded w-1/3"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-surface-variant dark:bg-[#2a2c2e] rounded-full"></div>
                    <div className="h-4 bg-surface-variant dark:bg-[#2a2c2e] rounded w-2/3"></div>
                </div>
            </div>
            
            <div className="h-10 bg-surface-variant dark:bg-[#2a2c2e] rounded-xl w-full mt-auto"></div>
        </div>
    );
};

export default SkeletonCard;
