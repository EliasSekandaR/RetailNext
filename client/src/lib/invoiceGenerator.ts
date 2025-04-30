import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define the interface for order item
interface OrderItemForInvoice {
  product?: {
    name: string;
    sku: string;
  };
  quantity: number;
  price: number;
}

// Define the interface for customer
interface CustomerForInvoice {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Define the interface for order
interface OrderForInvoice {
  orderNumber: string;
  date: string;
  items: OrderItemForInvoice[];
  customer?: CustomerForInvoice;
  status: string;
  notes?: string;
}

// Function to create and download invoice
export const generateInvoice = async (order: OrderForInvoice) => {
  const companyInfo = {
    name: "Retail Management System",
    address: "123 Commerce Street",
    city: "Business City, BC 12345",
    phone: "(555) 123-4567",
    email: "support@retailmanagementsystem.com",
    website: "www.retailmanagementsystem.com",
    logo: "" // Logo URL if available
  };
  
  // Create a temporary container to render invoice HTML
  const invoiceContainer = document.createElement('div');
  invoiceContainer.style.padding = '20px';
  invoiceContainer.style.fontFamily = 'Arial, sans-serif';
  invoiceContainer.style.position = 'fixed';
  invoiceContainer.style.top = '-9999px';
  
  // Format date
  let formattedDate = "";
  try {
    const date = new Date(order.date);
    formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    formattedDate = "Invalid date";
  }
  
  // Calculate subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate tax (7% of subtotal)
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Build invoice HTML
  invoiceContainer.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; color: #2563eb; font-size: 28px;">${companyInfo.name}</h1>
          <p style="margin: 5px 0;">${companyInfo.address}</p>
          <p style="margin: 5px 0;">${companyInfo.city}</p>
          <p style="margin: 5px 0;">Phone: ${companyInfo.phone}</p>
          <p style="margin: 5px 0;">Email: ${companyInfo.email}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 24px;">INVOICE</h2>
          <p style="margin: 5px 0; font-weight: bold;">#${order.orderNumber}</p>
          <p style="margin: 5px 0;">Date: ${formattedDate}</p>
          <p style="margin: 5px 0;">Status: ${order.status.toUpperCase()}</p>
        </div>
      </div>
      
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 48%;">
          <h3 style="margin: 0 0 10px 0; color: #4b5563;">Bill To:</h3>
          <p style="margin: 5px 0; font-weight: bold;">${order.customer?.name || 'N/A'}</p>
          <p style="margin: 5px 0;">${order.customer?.email || ''}</p>
          <p style="margin: 5px 0;">${order.customer?.phone || ''}</p>
          <p style="margin: 5px 0;">${order.customer?.address || ''}</p>
          <p style="margin: 5px 0;">
            ${order.customer?.city || ''}
            ${order.customer?.state ? `, ${order.customer.state}` : ''}
            ${order.customer?.zipCode ? ` ${order.customer.zipCode}` : ''}
          </p>
        </div>
        <div style="width: 48%;">
          <h3 style="margin: 0 0 10px 0; color: #4b5563;">Payment Information:</h3>
          <p style="margin: 5px 0;">Payment Status: <span style="font-weight: bold; color: ${
            order.status === 'completed' ? '#10b981' : '#f59e0b'
          };">${order.status === 'completed' ? 'PAID' : 'PENDING'}</span></p>
          <p style="margin: 5px 0;">Payment Method: Invoice</p>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Item</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: bold;">${item.product?.name || 'Unknown Product'}</div>
                <div style="font-size: 12px; color: #6b7280;">SKU: ${item.product?.sku || 'N/A'}</div>
              </td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.price)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Tax (${(taxRate * 100).toFixed(0)}%):</span>
            <span>${formatCurrency(tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; font-size: 18px;">
            <span>Total:</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      ${order.notes ? `
        <div style="margin-top: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #4b5563;">Notes:</h3>
          <p style="margin: 0; padding: 10px; background-color: #f9fafb; border-radius: 4px;">${order.notes}</p>
        </div>
      ` : ''}
      
      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Thank you for your business!</p>
        <p>${companyInfo.website}</p>
      </div>
    </div>
  `;
  
  // Append to body temporarily
  document.body.appendChild(invoiceContainer);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(invoiceContainer);
    
    // Initialize PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add canvas image to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 30;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Save PDF
    pdf.save(`Invoice-${order.orderNumber}.pdf`);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice');
  } finally {
    // Remove temporary container
    document.body.removeChild(invoiceContainer);
  }
};