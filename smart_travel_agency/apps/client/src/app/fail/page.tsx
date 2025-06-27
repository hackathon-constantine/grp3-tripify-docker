import Link from "next/link";
import { XCircle } from "lucide-react";



export default function PaymentFailPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Payment Failed
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            We couldn't process your payment. Please try again.
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Your booking has not been confirmed. No charges have been made to your account.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-3">
                            
                            <Link
                                href="/"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}