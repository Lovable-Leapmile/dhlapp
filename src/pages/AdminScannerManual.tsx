import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AppBar } from "@/components/AppBar";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const AdminScannerManual = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Guest";

  return (
    <div className="min-h-screen flex flex-col bg-background pt-[180px]">
      <AppBar title="Scanner Manual" showBack username={username} />
      
      <main className="flex-1 px-6 py-8 pb-24 overflow-y-auto">
        {/* Setup Steps */}
        <div className="mb-8 space-y-4">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <p className="text-base"><span className="font-semibold">Step 1:</span> Restart the device.</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <p className="text-base"><span className="font-semibold">Step 2:</span> Press and hold the button for 30 seconds to turn off the barcode reader.</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <p className="text-base"><span className="font-semibold">Step 3:</span> Reset the device's Bluetooth settings.</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <p className="text-base"><span className="font-semibold">Step 4:</span> Press the button again to turn on the barcode reader.</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <p className="text-base"><span className="font-semibold">Step 5:</span> Follow the steps below using the QR code to connect the barcode reader.</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <p className="text-base">
              <span className="font-semibold">Step 6:</span>{" "}
              <span 
                className="text-blue-600 underline cursor-pointer"
                onClick={() => navigate("/admin/test-scanner")}
              >
                Click here
              </span>
              {" "}to test if the scanner is connected properly or not.
            </p>
          </div>
        </div>

        {/* Factory Default */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Factory Default</h2>
          <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center">
            <QRCodeSVG value="S_CMD_00F0" size={150} level="M" />
            <p className="mt-3 text-sm font-medium text-foreground">S_CMD_00F0</p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bluetooth Pairing Setup */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Bluetooth Paring Setup</h2>
          <h3 className="text-lg font-semibold mb-3 text-foreground">PAIR INSTRUCTION :</h3>
          
          <div className="bg-card p-4 rounded-lg shadow-sm mb-4">
            <p className="text-base mb-3">
              <span className="font-semibold">A : Barcode Scanner pair with Cradle</span>
            </p>
            <p className="text-base mb-4">
              <span className="font-semibold">Step 1</span> - Scan Below Pairing Code I, Code II in sequence, and the scanner LED indicator become blue and flashing.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <QRCodeSVG value="X=0100" size={120} level="M" />
                <p className="mt-3 text-sm font-medium text-foreground">Code I</p>
                <p className="text-xs text-muted-foreground">X=0100</p>
              </div>
              <div className="flex flex-col items-center">
                <QRCodeSVG value="X=0101" size={120} level="M" />
                <p className="mt-3 text-sm font-medium text-foreground">Code II</p>
                <p className="text-xs text-muted-foreground">X=0101</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Sleep Time Setting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Sleep Time Setting</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=1006" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">1 min</p>
              <p className="text-xs text-muted-foreground">X=1006</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=1007" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">5 min</p>
              <p className="text-xs text-muted-foreground">X=1007</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=1008" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">10 min</p>
              <p className="text-xs text-muted-foreground">X=1008</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=1000" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">None</p>
              <p className="text-xs text-muted-foreground">X=1000</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Transmit Speed */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Transmit Speed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=0018" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">No delay</p>
              <p className="text-xs text-muted-foreground">X=0018</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=0025" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">Delay 10 ms</p>
              <p className="text-xs text-muted-foreground">X=0025</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col items-center">
              <QRCodeSVG value="X=0029" size={100} level="M" />
              <p className="mt-3 text-sm font-semibold text-foreground">Delay 30 ms</p>
              <p className="text-xs text-muted-foreground">X=0029</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminScannerManual;
