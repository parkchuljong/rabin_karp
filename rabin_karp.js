// 전역 변수 선언 및 초기화
let parent = '';          // 검색할 전체 문자열
let pattern = '';         // 찾을 패턴 문자열
let parentLen = 0;        // 전체 문자열의 길이
let patternLen = 0;       // 패턴 문자열의 길이
let parentHash = 0;       // 현재 부모 문자열의 해시값
let patternHash = 0;      // 패턴 문자열의 해시값
let power = 1;            // 해시 계산에 사용되는 2의 거듭제곱 값
let currentIndex = 0;     // 현재 검사 중인 인덱스
let foundAny = false;     // 패턴 발견 여부
let matchIndices = [];    // 패턴이 발견된 위치를 저장하는 배열

/**
 * 초기화 함수: 문자열과 패턴을 입력받아 해시값을 계산하고, 초기 상태로 설정
 */
function initialize() {
    // 사용자 입력값 가져오기
    parent = document.getElementById('parent').value;
    pattern = document.getElementById('pattern').value;

    // 각 변수 초기화
    parentLen = parent.length;
    patternLen = pattern.length;
    parentHash = 0;
    patternHash = 0;
    power = 1;
    currentIndex = 0;
    foundAny = false;
    matchIndices = [];

    let parentFormula = []; // 부모 문자열의 초기 해시 계산 과정을 저장
    let patternFormula = []; // 패턴 문자열의 초기 해시 계산 과정을 저장
    
    // 초기 해시값 계산 (문자별로 ASCII 값 × 2^n 계산)
    for (let j = 0; j < patternLen; j++) {
        const powerStr = j === 0 ? '1' : `2^${j}`; // 거듭제곱 표시
        parentFormula.push(`${parent.charCodeAt(patternLen - 1 - j)} × ${powerStr}`);
        patternFormula.push(`${pattern.charCodeAt(patternLen - 1 - j)} × ${powerStr}`);
        parentHash += parent.charCodeAt(patternLen - 1 - j) * power; // 부모 문자열 해시값 계산
        patternHash += pattern.charCodeAt(patternLen - 1 - j) * power; // 패턴 문자열 해시값 계산

        if (j < patternLen - 1) {
            power *= 2; // 거듭제곱 값을 갱신
        }
    }

    // 초기화 상태 출력
    document.getElementById('output').innerHTML = `
        <p>해시 계산이 초기화되었습니다. "다음 단계"를 눌러 진행하세요.</p>
        <p class="formula">부모 문자열 초기 해시 공식: ${parentFormula.join(' + ')}</p>
        <p class="formula">패턴 해시 공식: ${patternFormula.join(' + ')}</p>
        <p class="formula">초기 부모 해시: ${parentHash}, 패턴 해시: ${patternHash}</p>
    `;
}

/**
 * 현재 인덱스에서 해시값을 비교하고 결과를 출력
 */
function nextStep() {
    const output = document.getElementById('output');
    output.innerHTML = ''; // 이전 출력 지우기

    // 검색 범위를 벗어났는지 확인
    if (currentIndex > parentLen - patternLen) {
        showFinalResult(output); // 검색 종료 후 최종 결과 표시
        return;
    }

    // 현재 단계의 해시 계산
    let formula = calculateCurrentHash();
    const currentSubstring = parent.substring(currentIndex, currentIndex + patternLen); // 현재 부분 문자열
    const matchHash = parentHash === patternHash
        ? '<span class="highlight">해시 일치</span>'
        : '<span class="failed">해시 불일치</span>';

    // 단계별 내용 생성
    let content = generateStepContent(currentSubstring, matchHash, formula);
    
    // 해시가 일치할 경우 문자 비교 수행
    if (parentHash === patternHash) {
        content += compareCharacters();
    }

    // 결과를 DOM에 추가
    const stepContainer = document.createElement('div');
    stepContainer.className = 'step-container';
    stepContainer.innerHTML = content;
    output.appendChild(stepContainer);

    currentIndex++; // 다음 인덱스로 이동
}

/**
 * 현재 해시값 계산 함수
 * 이전 인덱스의 해시값을 이용하여 현재 해시값을 효율적으로 계산(Rabin-karp fingerprint)
 */
function calculateCurrentHash() {
    if (currentIndex > 0) {
        const powerStr = getPowerString(power); // 거듭제곱 문자열 생성
        const formula = `2 × (${parentHash} - ${parent.charCodeAt(currentIndex - 1)} × ${powerStr}) + ${parent.charCodeAt(currentIndex + patternLen - 1)}`;
        parentHash = 2 * (parentHash - parent.charCodeAt(currentIndex - 1) * power) + parent.charCodeAt(currentIndex + patternLen - 1);
        return formula;
    }
    return `초기 해시: ${parentHash}`;
}

/**
 * 2의 거듭제곱 값을 문자열로 변환
 */
function getPowerString(power) {
    if (power === 1) return '1';
    let exponent = Math.log2(power);
    return `2^${exponent}`;
}

/**
 * 단계별 내용을 생성하여 HTML로 반환
 */
function generateStepContent(currentSubstring, matchHash, formula) {
    let content = `
        <p>
            인덱스 ${currentIndex + 1}: 부분문자열 '${currentSubstring}' <br>
            부모 해시: ${parentHash}, 패턴 해시: ${patternHash} <br>
            ${matchHash} <br>
            <span class="formula">해시 계산식: ${formula}</span>
        </p>
    `;

    // 해시가 일치하면 상세 계산 과정 추가
    if (parentHash === patternHash) {
        let detailedFormula = [];
        for (let i = 0; i < patternLen; i++) {
            const charCode = parent.charCodeAt(currentIndex + i);
            const powerStr = i === 0 ? '1' : `2^${i}`;
            detailedFormula.push(`${charCode} × ${powerStr}`);
        }
        content += `
            <p class="formula">
                부모 해시 계산식: ${detailedFormula.join(' + ')} = ${parentHash}
            </p>
        `;
    }

    return content;
}

/**
 * 문자 비교 수행
 * 해시가 일치할 때 실제 문자를 비교하여 결과를 반환
 */
function compareCharacters() {
    let found = true;
    let comparisonDetails = '';
    
    for (let j = 0; j < patternLen; j++) {
        if (parent[currentIndex + j] !== pattern[j]) {
            found = false;
            comparisonDetails += `<span class="failed">위치 ${j + 1}에서 불일치 ('${parent[currentIndex + j]}' != '${pattern[j]}')</span><br>`;
        } else {
            comparisonDetails += `<span class="highlight">위치 ${j + 1}에서 일치 ('${parent[currentIndex + j]}' == '${pattern[j]}')</span><br>`;
        }
    }
    
    if (found) {
        matchIndices.push(currentIndex); // 일치 인덱스 저장
        foundAny = true;
        return `<p><span class="highlight">패턴이 위치 ${currentIndex + 1}에서 발견되었습니다</span></p>`;
    }
    
    return `<p class="comparison">문자 비교:<br>${comparisonDetails}</p>`;
}

/**
 * 최종 결과를 표시하는 함수
 * 검색이 끝나면 결과를 출력
 */
function showFinalResult(output) {
    let content = !foundAny ? '<p class="failed">일치하는 패턴을 찾을 수 없습니다.</p>' : '';
    
    // 전체 문자열에서 패턴 일치 부분 강조 표시
    let highlightedParent = '';
    for (let i = 0; i < parentLen; i++) {
        if (matchIndices.includes(i)) {
            highlightedParent += `<span class="highlight-match">${parent.slice(i, i + patternLen)}</span>`;
            i += patternLen - 1; // 일치한 부분 건너뛰기
        } else {
            highlightedParent += parent[i];
        }
    }
    
    const finalContainer = document.createElement('div');
    finalContainer.className = 'step-container';
    finalContainer.innerHTML = `
        ${content}
        <p>검색 완료. 일치하는 부분:</p>
        <p>${highlightedParent}</p>
    `;
    
    output.appendChild(finalContainer);
}
