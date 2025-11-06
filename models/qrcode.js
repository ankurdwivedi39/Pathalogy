<script>
    // ... (Your existing code and functions) ...

    // 💡 NEW CONSTANTS: Replace with your actual UPI details
    const YOUR_UPI_VPA = 'annukumar@okhdfcbank'; // Example VPA
    const YOUR_BUSINESS_NAME = 'Khushipath Diagnostics';

    // 💡 NEW: QR Code Generation Logic
    function generateUpiQrCode(totalAmount) {
        const amountInRupees = (totalAmount).toFixed(2); // Ensure two decimal places

        // 1. Construct the UPI Payment URI (Universal Link Format)
        // pa=Payee VPA; pn=Payee Name; cu=Currency; am=Amount; mc=Merchant Code (optional)
        const upiUri = `upi://pay?pa=${YOUR_UPI_VPA}&pn=${encodeURIComponent(YOUR_BUSINESS_NAME)}&am=${amountInRupees}&cu=INR`;
        
        const qrCanvas = document.getElementById('qrCodeCanvas');
        qrCanvas.innerHTML = ''; // Clear previous code

        // 2. GENERATE QR CODE (Placeholder - requires a library like 'qrcode.js')
        // In a real project, you would call: new QRCode(qrCanvas, { text: upiUri, ... });
        
        // --- START SIMULATION: Draw a placeholder box ---
        const placeholderDiv = document.createElement('div');
        placeholderDiv.style.cssText = 'width:100%; height:100%; background: #e0e0e0; display:flex; align-items:center; justify-content:center; border: 2px solid #3f51b5; font-size:12px; text-align:center; padding: 10px;';
        placeholderDiv.innerHTML = `QR Code Generated!<br>Amount: ₹${amountInRupees}<br>VPA: ${YOUR_UPI_VPA}<br>(${Math.random().toString(36).substring(7).toUpperCase()})`;
        qrCanvas.appendChild(placeholderDiv);
        // --- END SIMULATION ---

        document.getElementById('displayVpa').textContent = YOUR_UPI_VPA;
    }

    // 💡 NEW: Logic to Toggle QR Code Display
    function toggleQrCodeDisplay(paymentMethodValue) {
        const qrContainer = document.getElementById('upiQrCodeContainer');
        const summaryTotalElement = document.getElementById('summary-total-amount');
        
        // Extract total amount from summary (e.g., "₹2,249" -> 2249)
        const totalAmountText = summaryTotalElement.textContent.replace('₹', '').replace(/,/g, '').trim();
        const totalAmount = parseFloat(totalAmountText);

        if (paymentMethodValue === 'UPI/Card on Spot' || paymentMethodValue === 'Bank Transfer (Pre-Payment)') {
            generateUpiQrCode(totalAmount);
            qrContainer.style.display = 'block';
        } else {
            qrContainer.style.display = 'none';
        }
    }


    // 3. Attach QR Code Toggler to Payment Radio Buttons
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Update the hidden field (as already implemented in the previous step)
            document.getElementById('selectedPaymentMethod').value = this.value; 
            
            // 🔑 Trigger the QR code toggle
            toggleQrCodeDisplay(this.value); 
        });
    });

    // 4. Initial Load Fix: Ensure QR code appears if a digital option is default
    document.addEventListener('DOMContentLoaded', () => {
        // ... (Your existing DOMContentLoaded logic) ...
        
        const defaultPaymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        toggleQrCodeDisplay(defaultPaymentMethod);
        
        // Also update button text correctly on load after all summaries are calculated
        const { totalPrice } = initializeSummaryData();
        document.getElementById('placeOrderBtn').textContent = `Confirm Booking for ${formatter.format(totalPrice)}`;
    });

    // ... (Your existing form submission and helper functions) ...
</script>