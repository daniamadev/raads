function exportToPdf() {
    try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) throw new Error("A biblioteca jsPDF não está disponível.");

        // Configurações do documento
        const doc = new jsPDF();
        let y = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const maxWidth = pageWidth - 2 * margin;

        // Cores do tema (baseadas no seu HTML)
        const colors = {
            primary: [139, 92, 246],   // #8b5cf6 (roxo)
            secondary: [236, 72, 153], // #ec4899 (rosa)
            lightBg: [243, 232, 255],  // #f3e8ff (roxo claro)
            selectedBg: [252, 231, 243] // #fce7f3 (rosa claro)
        };

        // Estilos
        const styles = {
            header: { size: 20, color: colors.primary, align: 'center', font: 'helvetica', style: 'bold' },
            subtitle: { size: 11, color: [100, 100, 100], align: 'center', font: 'helvetica' },
            question: { size: 12, color: [31, 41, 55], font: 'helvetica', style: 'bold' },
            option: { size: 11, color: [75, 85, 99], font: 'helvetica' },
            selectedOption: { size: 11, color: colors.secondary, font: 'helvetica', style: 'bold' }
        };

        // Função para adicionar texto com estilo
        function addText(text, x, y, style) {
            doc.setFont(style.font, style.style || 'normal');
            doc.setFontSize(style.size);
            doc.setTextColor(...style.color);
            
            const lines = doc.splitTextToSize(text, maxWidth);
            
            if (style.align) {
                doc.text(lines, x, y, { align: style.align });
            } else {
                doc.text(lines, x, y);
            }
            
            return lines.length * (style.size * 0.35);
        }

        // Cabeçalho com fundo colorido
        doc.setFillColor(...colors.lightBg);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        addText("RESULTADOS DO QUIZ RAADS-R", pageWidth / 2, 25, styles.header);
        
        const now = new Date();
        addText(`Gerado em ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`, 
               pageWidth / 2, 38, styles.subtitle);
        
        y = 50; // Posição inicial do conteúdo

        // Adiciona cada pergunta e resposta
        quizData.forEach((question, index) => {
            // Quebra de página se necessário
            if (y > doc.internal.pageSize.height - 50) {
                doc.addPage();
                y = 30;
                // Cabeçalho de continuação
                doc.setFillColor(...colors.lightBg);
                doc.rect(0, 0, pageWidth, 20, 'F');
                addText("RAADS-R (Continuação)", pageWidth / 2, 20, {
                    ...styles.header,
                    size: 16
                });
                y = 40;
            }

            // Container da pergunta (estilo igual ao HTML)
            doc.setFillColor(...colors.lightBg);
            //doc.roundedRect(margin - 5, y - 8, maxWidth + 10, 20, 3, 3, 'F');
            doc.setDrawColor(...colors.primary);
            doc.setLineWidth(0.5);
            doc.line(margin - 5, y - 8, margin - 5, y + 4); // Borda lateral esquerda
            
            const questionText = `${index + 1}. ${question.question}`;
            const questionHeight = addText(questionText, margin, y, styles.question);
            y += questionHeight + 2; //era 10, agora 2 para espaçamento reduzido

            // Opções de resposta
            question.options.forEach((option, optIndex) => {
                if (y > doc.internal.pageSize.height - 20) {
                    doc.addPage();
                    y = 30;
                    doc.setFillColor(...colors.lightBg);
                    doc.rect(0, 0, pageWidth, 20, 'F');
                    addText("RAADS-R (Continuação)", pageWidth / 2, 20, {
                        ...styles.header,
                        size: 16
                    });
                    y = 10; //era 40, agora 10 para começar mais alto
                }

                const isSelected = userAnswers[index] === optIndex;
                
                // Destaque para resposta selecionada (rosa claro)
                if (isSelected) {
                    doc.setFillColor(...colors.selectedBg);
                    //doc.roundedRect(margin - 3, y - 3, maxWidth + 6, 15, 2, 2, 'F');
                }
                
                // Usamos • para selecionado e ◦ para não selecionado (caracteres mais confiáveis)
                const bullet = isSelected ? "x" : "o";
                const optionText = ` ${bullet} ${option}`;
                
                const optionHeight = addText(
                    optionText, 
                    margin + 2, 
                    y + 4, 
                    isSelected ? styles.selectedOption : styles.option
                );
                
                y += optionHeight + 2; // Espaçamento reduzido
            });

            y += 15; // Espaço entre perguntas, era 5 mudei para 10
        });

        // Rodapé
        doc.setFillColor(...colors.lightBg);
        doc.rect(0, 280, pageWidth, 20, 'F');
        addText("© Quiz RAADS-R - Resultados automáticos", 
               pageWidth / 2, 287, {
                   size: 10,
                   color: colors.primary,
                   align: 'center',
                   font: 'helvetica'
               });

        // Salva o PDF
        doc.save(`Resultados_RAADS-R_${now.getTime()}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        showMessageBox('Erro de Exportação', 'Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    }
}