import jsPDF from 'jspdf';
import { Facture } from '../types/facture';

export const generateInvoicePDF = (facture: Facture) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // En-tête
  doc.setFontSize(22);
  doc.text('FACTURE', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`N° ${facture.numero}`, pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Émise le ${new Date(facture.date_emission).toLocaleDateString()}`, pageWidth / 2, 42, { align: 'center' });

  // Bénéficiaire
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bénéficiaire :', margin, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(facture.fournisseur_client_nom || 'Non renseigné', margin, 62);

  // Montants
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails :', margin, 75);

  const yStart = 85;
  let y = yStart;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  doc.text(`Montant HT : ${facture.montant_ht.toLocaleString()} FCFA`, margin, y);
  y += 7;
  doc.text(`TVA (18%) : ${facture.tva.toLocaleString()} FCFA`, margin, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Montant TTC : ${facture.montant_ttc.toLocaleString()} FCFA`, margin, y);
  y += 10;

  // Statut
  doc.setFont('helvetica', 'normal');
  doc.text(`Statut : ${facture.statut}`, margin, y);
  y += 7;
  if (facture.date_echeance) {
    doc.text(`Échéance : ${new Date(facture.date_echeance).toLocaleDateString()}`, margin, y);
  }

  // Pied de page
  doc.setFontSize(8);
  doc.text('Document généré par APP PME V3', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`facture_${facture.numero}.pdf`);
};
