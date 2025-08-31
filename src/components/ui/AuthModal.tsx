"use client";

import React from 'react';

type AuthModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-black border border-casino-gold rounded-lg p-6 w-full max-w-md text-white shadow-xl">
				<h2 className="text-xl font-bold mb-2 text-casino-gold">Sign in or Create Account</h2>
				<p className="text-sm text-gray-300 mb-6">
					This is a placeholder authentication modal. Replace with your full auth UI when ready.
				</p>
				<div className="flex justify-end gap-2">
					{onSuccess && (
						<button
							className="casino-button"
							onClick={() => {
								try { onSuccess(); } finally { onClose(); }
							}}
						>
							Continue
						</button>
					)}
					<button className="casino-button-secondary" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

export default AuthModal;

