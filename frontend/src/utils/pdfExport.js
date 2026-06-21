import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(element, ticker) {
  if (!element) return

  // Temporarily expand all hidden overflow for PDF
  const originalOverflow = document.body.style.overflow
  document.body.style.overflow = 'visible'

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#F4F6F9',
      windowWidth: 1200,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = pdfWidth / imgWidth
    const scaledHeight = imgHeight * ratio

    let heightLeft = scaledHeight
    let position = 0

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight)
    heightLeft -= pdfHeight

    // Additional pages
    while (heightLeft > 0) {
      position = heightLeft - scaledHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight)
      heightLeft -= pdfHeight
    }

    const date = new Date().toISOString().split('T')[0]
    pdf.save(`${ticker}_EquityIQ_Analysis_${date}.pdf`)
  } finally {
    document.body.style.overflow = originalOverflow
  }
}
