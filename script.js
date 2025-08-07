
class CleaningDutyPicker {
    constructor() {
        this.drawButton = document.getElementById('drawButton');
        this.resetButton = document.getElementById('resetButton');
        this.saveButton = document.getElementById('saveButton');
        this.shareButton = document.getElementById('shareButton');
        this.resultContainer = document.getElementById('result');
        this.selectedNumbersDiv = document.getElementById('selectedNumbers');
        this.totalCountInput = document.getElementById('totalCount');
        this.pickCountInput = document.getElementById('pickCount');
        
        this.lastResults = [];
        this.history = JSON.parse(localStorage.getItem('cleaningDutyHistory') || '[]');
        
        this.init();
        this.showWelcomeMessage();
    }
    
    init() {
        this.drawButton.addEventListener('click', () => this.drawNumbers());
        this.resetButton.addEventListener('click', () => this.reset());
        this.saveButton.addEventListener('click', () => this.saveResults());
        this.shareButton.addEventListener('click', () => this.shareResults());
        
        // Input validation
        this.totalCountInput.addEventListener('change', () => this.validateInputs());
        this.pickCountInput.addEventListener('change', () => this.validateInputs());
    }
    
    showWelcomeMessage() {
        Swal.fire({
            title: '🧹 청소당번 뽑기에 오신 것을 환영합니다!',
            text: '공정하고 랜덤한 추첨으로 청소당번을 선정해보세요.',
            icon: 'info',
            confirmButtonText: '시작하기',
            confirmButtonColor: '#667eea',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    }
    
    validateInputs() {
        const totalCount = parseInt(this.totalCountInput.value);
        const pickCount = parseInt(this.pickCountInput.value);
        
        if (pickCount > totalCount) {
            Swal.fire({
                title: '⚠️ 입력 오류',
                text: '뽑을 인원이 전체 인원보다 클 수 없습니다.',
                icon: 'warning',
                confirmButtonColor: '#f56565'
            });
            this.pickCountInput.value = Math.min(pickCount, totalCount);
        }
    }
    
    async drawNumbers() {
        const totalCount = parseInt(this.totalCountInput.value);
        const pickCount = parseInt(this.pickCountInput.value);
        
        if (pickCount > totalCount) {
            this.validateInputs();
            return;
        }
        
        // Show loading state
        this.drawButton.classList.add('btn-loading');
        this.drawButton.disabled = true;
        
        // Show drawing animation
        const drawingAlert = Swal.fire({
            title: '🎲 추첨 중...',
            text: '공정한 랜덤 추첨을 진행하고 있습니다.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Simulate drawing time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const numbers = this.generateRandomNumbers(totalCount, pickCount);
        this.lastResults = numbers;
        
        drawingAlert.close();
        
        // Show results with SweetAlert
        await this.showResultsAlert(numbers);
        
        // Display results on page
        this.displayResults(numbers);
        
        // Reset button state
        this.drawButton.classList.remove('btn-loading');
        this.drawButton.disabled = false;
    }
    
    generateRandomNumbers(totalCount, pickCount) {
        const numbers = [];
        const availableNumbers = Array.from({length: totalCount}, (_, i) => i + 1);
        
        // Fisher-Yates shuffle algorithm
        for (let i = 0; i < pickCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            numbers.push(availableNumbers.splice(randomIndex, 1)[0]);
        }
        
        return numbers.sort((a, b) => a - b);
    }
    
    async showResultsAlert(numbers) {
        const numbersHtml = numbers.map(num => 
            `<span class="badge bg-primary me-2 mb-2" style="font-size: 1.2rem; padding: 8px 12px;">${num}번</span>`
        ).join('');
        
        await Swal.fire({
            title: '🎉 추첨 결과',
            html: `
                <div class="mb-3">
                    <strong>선정된 청소당번:</strong>
                </div>
                <div class="d-flex flex-wrap justify-content-center">
                    ${numbersHtml}
                </div>
            `,
            icon: 'success',
            confirmButtonText: '확인',
            confirmButtonColor: '#48bb78',
            showClass: {
                popup: 'animate__animated animate__bounceIn'
            }
        });
    }
    
    displayResults(numbers) {
        this.selectedNumbersDiv.innerHTML = '';
        
        numbers.forEach((number, index) => {
            setTimeout(() => {
                const col = document.createElement('div');
                col.className = 'col-auto';
                
                const badge = document.createElement('div');
                badge.className = 'badge number-badge animate-in p-3 fs-5';
                badge.textContent = `${number}번`;
                
                col.appendChild(badge);
                this.selectedNumbersDiv.appendChild(col);
            }, index * 300);
        });
        
        setTimeout(() => {
            this.resultContainer.classList.remove('d-none');
            this.resultContainer.classList.add('show');
        }, 200);
    }
    
    reset() {
        Swal.fire({
            title: '🔄 다시 뽑기',
            text: '새로운 추첨을 진행하시겠습니까?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '네, 다시 뽑기',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                this.resultContainer.classList.add('d-none');
                this.resultContainer.classList.remove('show');
                this.selectedNumbersDiv.innerHTML = '';
                
                Swal.fire({
                    title: '초기화 완료!',
                    text: '새로운 추첨을 진행해보세요.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    }
    
    saveResults() {
        if (this.lastResults.length === 0) return;
        
        const timestamp = new Date().toLocaleString('ko-KR');
        const result = {
            numbers: this.lastResults,
            timestamp: timestamp,
            totalCount: parseInt(this.totalCountInput.value),
            pickCount: parseInt(this.pickCountInput.value)
        };
        
        this.history.unshift(result);
        this.history = this.history.slice(0, 10); // Keep only last 10 results
        localStorage.setItem('cleaningDutyHistory', JSON.stringify(this.history));
        
        Swal.fire({
            title: '💾 저장 완료!',
            text: '추첨 결과가 저장되었습니다.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    }
    
    async shareResults() {
        if (this.lastResults.length === 0) return;
        
        const shareText = `🧹 청소당번 추첨 결과\n선정된 번호: ${this.lastResults.join(', ')}번\n추첨 시간: ${new Date().toLocaleString('ko-KR')}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '청소당번 추첨 결과',
                    text: shareText
                });
            } catch (error) {
                this.copyToClipboard(shareText);
            }
        } else {
            this.copyToClipboard(shareText);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({
                title: '📋 복사 완료!',
                text: '결과가 클립보드에 복사되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }).catch(() => {
            Swal.fire({
                title: '공유',
                text: text,
                confirmButtonText: '확인',
                confirmButtonColor: '#667eea'
            });
        });
    }
}

// 페이지 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new CleaningDutyPicker();
});
