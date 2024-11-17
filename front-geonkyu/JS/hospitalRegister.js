document.getElementById('hospitalRegisterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // 입력 필드 값 검증
    const hospitalName = document.getElementById('hospitalName').value;
    const representative = document.getElementById('representative').value;
    const businessNumber = document.getElementById('businessNumber').value;
    const zipcode = document.getElementById('zipcode').value;
    const address = document.getElementById('address').value;
    const detailAddress = document.getElementById('detailAddress').value;
    const contact = document.getElementById('contact').value;
    const website = document.getElementById('website').value;

    let isValid = true;

    // 병원 상호명 체크
    if (hospitalName === '') {
        document.getElementById('hospitalNameError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('hospitalNameError').style.display = 'none';
    }

  
    // 대표자 체크
    if (representative === '') {
        document.getElementById('representativeError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('representativeError').style.display = 'none';
    }

    // 사업자등록번호 체크
    if (businessNumber === '') {
        document.getElementById('businessNumberError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('businessNumberError').style.display = 'none';
    }

    // 주소 체크
    if (zipcode === '' || address === '' || detailAddress === '') {
        document.getElementById('zipcodeError').style.display = 'block';
        document.getElementById('addressError').style.display = 'block';
        document.getElementById('detailAddressError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('zipcodeError').style.display = 'none';
        document.getElementById('addressError').style.display = 'none';
        document.getElementById('detailAddressError').style.display = 'none';
    }

    // 연락처 체크
    if (contact === '') {
        document.getElementById('contactError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('contactError').style.display = 'none';
    }

    // 사이트 주소 체크
    if (website === '') {
        document.getElementById('websiteError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('websiteError').style.display = 'none';
    }

    // 모든 입력이 유효할 경우
    if (isValid) {
        alert('병원 등록이 완료되었습니다.');
        // 여기서 서버로 데이터를 전송하는 로직 추가 가능 (fetch 등)
    }
});
