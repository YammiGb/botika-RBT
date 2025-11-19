import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const { siteSettings } = useSiteSettings();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Build effective payment methods list including Cash (Onsite)
  const cashMethod = {
    id: 'cash',
    name: 'Cash (Onsite)',
    account_number: '',
    account_name: '',
    qr_code_url: '',
    active: true,
    sort_order: 999,
    created_at: '',
    updated_at: ''
  } as any;
  const effectivePaymentMethods = [...paymentMethods, cashMethod];

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (effectivePaymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod((effectivePaymentMethods[0].id as PaymentMethod) || 'cash');
    }
  }, [effectivePaymentMethods, paymentMethod]);

  const selectedPaymentMethod = effectivePaymentMethods.find(method => method.id === paymentMethod);
  
  // Check if delivery is enabled
  const isDeliveryEnabled = siteSettings?.delivery_enabled === 'true';

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const orderDetails = `
🛒 Botika RBT INQUIRY

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}


📋 INQUIRY DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  return itemDetails;
}).join('\n')}
${serviceType === 'delivery' ? `🛵 DELIVERY` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
${paymentMethod === 'cash' ? '' : '📸 Payment Screenshot: Please attach your payment receipt screenshot'}

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this inquiry to proceed. Thank you for choosing Botika RBT! 💊
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/Botika.RBT?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
  };

  const isDetailsValid = customerName && contactNumber && 
    (serviceType !== 'delivery' || address);

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-black transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-inter font-semibold text-botika-dark ml-8">Inquiry Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inquiry Summary */}
          <div className="bg-botika-light rounded-xl shadow-sm p-6 border border-botika-border">
            <h2 className="text-2xl font-inter font-medium text-botika-dark mb-6">Inquiry Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-botika-border">
                  <div>
                    <h4 className="font-medium text-botika-dark">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
          </div>

          {/* Customer Details Form */}
          <div className="bg-botika-light rounded-xl shadow-sm p-6 border border-botika-border">
            <h2 className="text-2xl font-inter font-medium text-botika-dark mb-6">Customer Information</h2>
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-botika-dark mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-botika-cream"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-botika-dark mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-botika-cream"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-botika-dark mb-3">Service Type *</label>
                <div className={`grid gap-3 ${isDeliveryEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {[
                    { value: 'pickup', label: 'Pickup', icon: '🚶', enabled: true },
                    { value: 'delivery', label: 'Delivery', icon: '🛵', enabled: isDeliveryEnabled }
                  ].filter(option => option.enabled).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        serviceType === option.value
                          ? 'border-botika-accent bg-botika-accent text-white'
                          : 'border-botika-border bg-botika-cream text-gray-700 hover:border-botika-accent'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
                
                {/* Delivery disabled message */}
                {!isDeliveryEnabled && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">ℹ️ Note:</span> Delivery service is currently unavailable
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-botika-dark mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-botika-cream"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-botika-dark mb-2">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-botika-cream"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-botika-dark mb-2">Message</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-botika-cream"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-botika-accent text-white hover:bg-botika-hover hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-inter font-semibold text-botika-dark ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-botika-light rounded-xl shadow-sm p-6 border border-botika-border">
          <h2 className="text-2xl font-inter font-medium text-botika-dark mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {effectivePaymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  paymentMethod === method.id
                    ? 'border-botika-accent bg-botika-accent text-white'
                    : 'border-botika-border bg-botika-cream text-gray-700 hover:border-botika-accent'
                }`}
              >
                <span className="text-2xl">{method.id === 'cash' ? '💵' : '💳'}</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code (hide for cash) */}
          {selectedPaymentMethod && paymentMethod !== 'cash' && (
            <div className="bg-botika-beige rounded-lg p-6 mb-6 border border-botika-border">
              <h3 className="font-medium text-botika-dark mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-botika-dark font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-gray-600 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-botika-border shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment instructions: show proof section only for non-cash */}
          {paymentMethod !== 'cash' ? (
            <div className="bg-botika-cream border border-botika-border rounded-lg p-4">
              <h4 className="font-medium text-botika-dark mb-2">📸 Payment Proof Required</h4>
              <p className="text-sm text-gray-700">
                After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
              </p>
            </div>
          ) : (
            <div className="bg-botika-cream border border-botika-border rounded-lg p-4">
              <h4 className="font-medium text-botika-dark mb-2">💵 Pay with Cash Onsite</h4>
              <p className="text-sm text-gray-700">
                Please proceed to the counter and pay in cash when you arrive. No payment screenshot needed.
              </p>
            </div>
          )}
        </div>

        {/* Final Inquiry Summary */}
        <div className="bg-botika-light rounded-xl shadow-sm p-6 border border-botika-border">
          <h2 className="text-2xl font-inter font-medium text-botika-dark mb-6">Final Inquiry Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-botika-beige rounded-lg p-4 border border-botika-border">
              <h4 className="font-medium text-botika-dark mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Name: {customerName}</p>
              <p className="text-sm text-gray-600">Contact: {contactNumber}</p>
              <p className="text-sm text-gray-600">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-gray-600">Address: {address}</p>
                  {landmark && <p className="text-sm text-gray-600">Landmark: {landmark}</p>}
                </>
              )}
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-botika-border">
                <div>
                  <h4 className="font-medium text-botika-dark">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform bg-botika-accent text-white hover:bg-botika-hover hover:scale-[1.02]"
          >
            Send Inquiry via Messenger
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your inquiry. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;