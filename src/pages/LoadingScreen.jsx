import React from 'react';
import logoImage from '../assets/STACK_N_STEAL_LOGO_trans.jpg';

function LoadingScreen() {
    return (
        <div className="h-screen w-screen bg-white flex flex-col justify-center items-center text-center p-4">
            <style>
                {`
                    @keyframes card-fall {
                        0% { transform: translate3d(-35px, -100px, 100px) scale3d(1.2, 1.2, 1) rotate(0deg); opacity: 0; }
                        100% { transform: translate3d(0, 0, 0) scale3d(1.2, 1.2, 1) rotate(15deg); opacity: 1; }
                    }
                    .card-animation {
                        animation: card-fall 1.5s ease-out infinite;
                    }
                `}
            </style>
            <div className="flex flex-col items-center">
                <div className="mb-8">
                    <img alt="logo" src={logoImage} className="w-[350px]" />
                </div>
                <div className="h-24 relative">
                    <div className="card-animation w-[50px] h-[75px] bg-red-400 inline-block relative border-black border-[3px] rounded-[10px]"></div>
                </div>
                <span className="mt-4 w-full text-lg font-bold opacity-80 block text-center">
                    Connecting to Servers...
                </span>
                <span className="mt-2 text-red-500 w-96 text-xs font-semibold block text-center">
                    This game is in beta. Things may change drastically during development and your game could break. Play at your own risk!
                </span>
            </div>
        </div>
    );
}

export default LoadingScreen;
