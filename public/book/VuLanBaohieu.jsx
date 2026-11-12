import React, { useState } from 'react';

export default function VuLanBaohieu() {
  const pages = [
    // Trang 1
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '3px' }}>1. Phần Khởi Nguyện</h3>
        <p><strong>Nam-mô Bản Sư Thích-ca Mâu-ni Phật</strong> (3 lần)...</p>
        <p style={{ marginTop: '10px' }}>
          <strong>1. NGUYỆN HƯƠNG</strong><br />
          <em>(Chủ lễ quỳ ngay thẳng, dâng ba nén hương lên ngang trán, thành tâm xướng nguyện. Đại chúng cùng quán tưởng theo lời Nguyện)</em>
        </p>
        <p>Nam-mô Bổn Sư Thích-ca Mâu-ni Phật. O</p>
        <p>
          Nguyện đem lòng thành kính<br />
          Gởi theo đám mây hương<br />
          Phưởng phất khắp mười phương<br />
          Cúng dường ngôi Tam Bảo<br />
          Thệ trọn đời giữ đạo<br />
          Theo tự tánh làm lành<br />
          Cùng pháp giới chúng sanh<br />
          Cầu Phật thương gia hộ:
        </p>
        <p>
          Tâm bồ-đề kiên cố<br />
          Chí tu học vững bền<br />
          Xa bể khổ nguồn mê<br />
          Chóng quay về bờ giác O
        </p>
      </div>
    ),
    // Trang 2
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>1. Phần Khởi Nguyện (Tiếp theo)</h3>
        <p>
          Hôm nay nhân mùa Vu-lan, chúng con tề tựu trước Phật đài, phát nguyện trì tụng kinh Vu-lan và kinh Báo Hiếu, nguyện cho: Chánh pháp được lan truyền khắp chốn; lời Phật dạy được phổ biến muôn nơi; người người từ bỏ tham giận si mê; xứ xứ thấm nhuần từ bi, hạnh phúc. O
        </p>
        <p style={{ marginTop: '15px' }}>
          Kính nguyện: Cha mẹ hiện tại, an khang trường thọ, sữa pháp đượm nhuần, trí tuệ nảy sanh, não phiền dứt sạch. Nguyện cho hàng con cháu, sống hiếu thảo thuận hòa, nhớ ân đức mẹ cha, trở nên người hiền thiện. O
        </p>
        <p style={{ marginTop: '15px' }}>
          Lại nguyện: Cha mẹ đã quá vãng, cùng tất cả hương linh <em>(tên họ, pháp danh, ngày mất, hưởng thọ)</em>, khởi tâm niệm tuệ giác, thoát khỏi cõi luân hồi, niệm Phật được nhất tâm, siêu sinh về Tịnh Độ.
        </p>
        <p style={{ marginTop: '15px' }}>
          Khắp nguyện các chúng sanh, tin sâu lời Phật dạy, phát triển tâm bồ-đề, thực hành đạo Bồ-tát, đền đáp bốn ơn trọng, mau chứng thành quả Phật. O
        </p>
        <p><strong>Nam-mô Hương Cúng Dường Bồ-tát</strong> (3 lần) O</p>
        <p style={{ fontStyle: 'italic', color: '#c5b79b' }}>(Chủ lễ xá 3 xá rồi cắm nhang vào lư hương)</p>
      </div>
    ),
    // Trang 3
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>2. Tán Phật và Đảnh Lễ Tam Bảo</h3>
        <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>(Đại chúng đứng chắp tay, hướng về Phật, cùng tụng)</p>
        <p>
          Đấng Pháp Vương vô thượng,<br />
          Ba cõi chẳng ai bằng,<br />
          Thầy dạy khắp trời người,<br />
          Cha lành chung bốn loài.<br />
          Nay con nguyện quy y,<br />
          Diệt trừ vô lượng tội,<br />
          Dâng lên lời tán thán,<br />
          Ức kiếp vẫn không cùng. (1 xá) O
        </p>
        <p style={{ marginTop: '15px' }}>
          Phật là đấng giác ngộ mình<br />
          Độ người thoát khỏi tử sinh bao đời<br />
          Từ bi, trí tuệ rạng ngời<br />
          Là thầy ba cõi trời người xưa nay. O
        </p>
        <p style={{ marginTop: '10px', fontSize: '0.95em', color: '#d4c5a9' }}>
          <em>Chí tâm đảnh lễ tất cả đức Phật ba đời thường trú trong mười phương. (1 lạy) O</em>
        </p>
      </div>
    ),
    // Trang 4
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>2. Tán Phật (Tiếp theo)</h3>
        <p>
          Pháp là phương thuốc diệu thay,<br />
          Chữa lành bệnh khổ bao loài chúng sinh,<br />
          Như vầng trăng sáng lung linh,<br />
          Soi đường ra khỏi u minh mê mờ. O
        </p>
        <p style={{ marginTop: '10px', fontSize: '0.95em', color: '#d4c5a9' }}>
          <em>Chí tâm đảnh lễ tất cả Tôn Pháp ba đời thường trú trong mười phương. (1 lạy) O</em>
        </p>
        <p style={{ marginTop: '20px' }}>
          Tăng là những bậc chân tu,<br />
          Biết đời huyễn mộng, giã từ ra đi,<br />
          Thấm nhuần trí tuệ, từ bi,<br />
          Độ đời thoát khỏi tham… si khổ sầu. O
        </p>
        <p style={{ marginTop: '10px', fontSize: '0.95em', color: '#d4c5a9' }}>
          <em>Chí tâm đảnh lễ tất cả Hiền Thánh Tăng ba đời thường trú trong mười phương. (1 lạy) OOO</em>
        </p>
        <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold', color: '#e8bd70' }}>
          Để gieo trồng cội phước cho chính mình và thân bằng quyến thuộc.
        </p>
      </div>
    ),
    // Trang 5
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>3. Tán Hương</h3>
        <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>(Đại chúng ngồi thẳng lưng theo tư thế hoa sen. Duy-na và Duyệt chúng khai chuông mõ. Từ đây trở đi, chủ lễ xướng và đại chúng cùng tụng theo)</p>
        <p>
          Lò hương vừa bén chiên đàn<br />
          Tỏa xông pháp giới đạo tràng mười phương<br />
          Hiện thành mây báu cát tường<br />
          Xin Phật chứng giám tâm hương chí thành<br />
          Pháp thân các Phật tịnh thanh<br />
          Chứng minh hương nguyện, phước lành rưới ban.<br />
          <strong>Nam-mô Hương Vân Cái Bồ-tát.</strong> (3 lần) OOO
        </p>
      </div>
    ),
    // Trang 6
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>4. Phát Nguyện Trì Kinh &amp; 5. Tán Dương Giáo Pháp</h3>
        <p>
          Lạy đấng Thầy ba cõi,<br />
          Quy mạng Phật mười phương.<br />
          Nay con phát nguyện lớn,<br />
          Thọ trì kinh Vu-Lan,<br />
          Trên đền bốn ơn nặng,<br />
          Dưới cứu khổ ba đường.<br />
          Nguyện cho người thấy nghe<br />
          Đều phát tâm bồ-đề,<br />
          Sống an vui giải thoát. O<br />
          <strong>Nam-mô Bổn Sư Thích-ca Mâu-ni Phật.</strong> (3 lần) OOO
        </p>
        <hr style={{ borderColor: '#3d372c', margin: '20px 0' }} />
        <p>
          <strong>5. TÁN DƯƠNG GIÁO PHÁP</strong><br />
          Pháp Phật cao siêu, lý rộng sâu,<br />
          Trăm nghìn muôn kiếp khó tìm cầu,<br />
          Nay con gặp được xin trì tụng,<br />
          Nguyện hiểu chân kinh nghĩa nhiệm mầu.<br />
          <strong>Nam-mô Khai Pháp Tạng Bồ-tát.</strong> (3 lần) OOO
        </p>
      </div>
    ),
    // Trang 7
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 1)</h3>
        <p>
          Ta từng nghe lời dạy như vầy:<br />
          Một thuở nọ Thế Tôn an trụ,<br />
          Xá-vệ thành Kỳ Thụ viên trung,<br />
          Mục-liên mới đặng lục thông,<br />
          Muốn cho cha mẹ khỏi vòng trầm luân.<br />
          Công dưỡng dục thâm ân dốc trả,<br />
          Nghĩa sanh thành đạo cả mong đền,<br />
          Làm con hiếu hạnh trước tiên,<br />
          Bèn dùng huệ nhãn dưới trên kiếm tầm.<br />
          Thấy vong mẫu sanh làm ngạ quỷ,<br />
          Không uống ăn tiều tụy hình hài,<br />
          Mục-liên thấy vậy bi ai,<br />
          Biết mẹ đói khát ai hoài tình thâm.<br />
          Lo phẩm vật đem dâng từ mẫu<br />
          Đặng đỡ lòng cực khổ bấy lâu<br />
          Thấy cơm, mẹ rất lo âu<br />
          Tay tả che đậy hữu hầu bốc ăn.<br />
          Lòng bỏn sẻn tiền căn chưa dứt<br />
          Truyền cho diệu pháp ân cần thiết thi.
        </p>
      </div>
    ),
    // Trang 8
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 2)</h3>
        <p>
          Rằm tháng bảy là ngày Tự tứ,<br />
          Mười phương Tăng đều dự lễ này,<br />
          Phải toan sắm sửa chớ chầy,<br />
          Thức ăn trăm món, trái cây năm màu.<br />
          Lại phải sắm giường nằm nệm lót,<br />
          Cùng thau, bồn, đèn, đuốc, nhang, dầu,<br />
          Món ăn tinh sạch báu mầu,<br />
          Đựng trong bình bát vọng cầu kính dâng.<br />
          Chư Đại đức mười phương thọ thực,<br />
          Trong bảy đời sẽ được siêu thăng,<br />
          Lại thêm cha mẹ hiện tiền,<br />
          Đặng nhờ phước đức tiêu khiên ách nàn.<br />
          Vì ngày ấy thánh Tăng đều đủ,<br />
          Dầu ở đâu cũng tụ hội về<br />
          Như người thiền định sơn khê,<br />
          Tránh điều phiền não chăm về thiền na.
        </p>
      </div>
    ),
    // Trang 9
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 3)</h3>
        <p>
          Hoặc người đặng bốn tòa đạo quả,<br />
          Công tu hành nguyện thỏa vô sanh,<br />
          Hoặc người núi thẳm kinh hành,<br />
          Chẳng ham quyền quý ẩn danh lâm tòng.<br />
          Hoặc người đặng lục thông tấn phát,<br />
          Và những hàng Duyên Giác, Thinh Văn<br />
          Hoặc chư Bồ-tát mười phương,<br />
          Hiện hình làm sải ở gần chúng sanh.<br />
          Đều trì giới rất thanh rất tịnh,<br />
          Đạo đức dày chánh định chơn tâm,<br />
          Tất cả các bực Thánh phàm,<br />
          Đồng lòng thọ lãnh bát cơm lục hòa.<br />
          Người nào có sắm ra vật thực,<br />
          Đặng cúng dường Tự tứ Tăng thời,<br />
          Hiện tiền phụ mẫu của người,<br />
          Bà con quyến thuộc thảy đều nhờ ơn.
        </p>
      </div>
    ),
    // Trang 10
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 4)</h3>
        <p>
          Ba đường khổ chắc rằng ra khỏi,<br />
          Cảnh thanh nhàn hưởng thọ tự nhiên,<br />
          Như còn cha mẹ hiện tiền,<br />
          Nhờ đó cũng đặng bá niên thọ trường.<br />
          Như cha mẹ bảy đời quá vãng,<br />
          Sẽ hóa sanh về cõi thiên cung,<br />
          Người thời tuấn tú hình dung,<br />
          Hào quang chiếu sáng khắp cùng châu thân.<br />
          Phật dạy bảo mười phương Tăng chúng,<br />
          Phải tuân theo thể thức sau này,<br />
          Trước khi thọ thực đàn chay,<br />
          Phải cầu chú nguyện cho người tín gia.<br />
          Cầu thất thế mẹ cha thí chủ,<br />
          Định tâm thần quán đủ đừng quên,<br />
          Cho xong định ý hành thiền,<br />
          Mới dùng phẩm vật đàng tiền hiến dâng.
        </p>
      </div>
    ),
    // Trang 11
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 5)</h3>
        <p>
          Khi thọ dụng nên an vật thực,<br />
          Trước Phật đài hoặc tự tháp trung,<br />
          Chư Tăng chú nguyện viên dung,<br />
          Sau rồi tự tiện thọ dùng bữa trưa.<br />
          Pháp cứu tế Phật vừa nói dứt,<br />
          Mục-liên cùng Bồ-tát chư Tăng,<br />
          Đồng nhau tỏ dạ vui mừng.<br />
          Mục-liên cũng hết khóc than rầu buồn.<br />
          Mục-liên mẫu cũng trong ngày ấy,<br />
          Kiếp khổ về ngạ quỷ được tan,<br />
          Mục-liên bạch với Phật rằng:<br />
          Mẹ con nhờ sức Thánh Tăng khỏi nàn.<br />
          Lại cũng nhờ oai thần Tam Bảo,<br />
          Bằng chẳng thì nạn khổ khó ra,<br />
          Như sau đệ tử xuất gia,<br />
          Vu-lan-bồn pháp dùng mà độ sanh.
        </p>
      </div>
    ),
    // Trang 12
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 6)</h3>
        <p>
          Độ cha mẹ còn đang tại thế,<br />
          Hoặc bảy đời có thể đặng không?<br />
          Phật rằng: Lời hỏi rất thông,<br />
          Ta vừa muốn nói con liền hỏi theo,<br />
          Thiện nam tử, Tỳ-kheo nam nữ,<br />
          Cùng Quốc vương, Thái tử, Đại thần,<br />
          Tam công, Tể tướng, bá quan,<br />
          Cùng hàng lê thứ vạn dân cõi trần.<br />
          Như chí muốn đền ơn cha mẹ,<br />
          Hiện tại cùng thất thế tình thâm,<br />
          Đến rằm tháng bảy mỗi năm,<br />
          Sau khi kiết hạ chư Tăng tựu về.<br />
          Chính ngày ấy Phật đà hoan hỷ,<br />
          Phải sắm sanh đủ vị cơm canh,<br />
          Đựng trong bình bát tinh anh,<br />
          Chờ giờ Tự Tứ chúng Tăng cúng dường.
        </p>
      </div>
    ),
    // Trang 13
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Phần 7)</h3>
        <p>
          Đặng cầu nguyện song đường trường thọ,<br />
          Chẳng ốm đau cũng chẳng khổ chi,<br />
          Cùng cầu thất thế đồng thì,<br />
          Lìa nơi ngạ quỷ sanh về nhơn thiên,<br />
          Đặng hưởng phước nhân duyên vui đẹp,<br />
          Lại xa lìa nạn khổ cực thân,<br />
          Môn sanh Phật tử ân cần,<br />
          Hạnh tu hiếu thuận phải cần phải chuyên.<br />
          Thường cầu nguyện cha mẹ an ổn,<br />
          Cùng bảy đời phụ mẫu siêu sinh,<br />
          Ngày rằm tháng bảy mỗi năm,<br />
          Vì lòng hiếu thảo ân thâm phải đền.<br />
          Lễ cứu tế chí thành sắp đặt,<br />
          Để cúng dường chư Phật chư Tăng,<br />
          Ấy là báo đáp thù ân,<br />
          Sanh thành dưỡng dục song thân buổi đầu.
        </p>
      </div>
    ),
    // Trang 14
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Vu Lan Bồn (Hoàn mãn)</h3>
        <p>
          Đệ tử Phật lo âu gìn giữ,<br />
          Mới phải là Thích tử Thiền môn,<br />
          Vừa nghe dứt pháp Lan-bồn,<br />
          Môn sanh tứ chúng thảy đều hỷ hoan,<br />
          Mục-liên với bốn ban Phật tử,<br />
          Nguyện một lòng tín sự phụng hành,<br />
          Trước là trả nghĩa sanh thành,<br />
          Sau là cứu giúp chúng sanh muôn loài.<br />
          <strong>Nam mô Đại hiếu Mục-kiền-liên Bồ-tát.</strong>
        </p>
      </div>
    ),
    // Trang 15
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Phần 1)</h3>
        <p>
          Một thuở nọ Thế Tôn an trụ,<br />
          Xá-vệ thành Kỳ thụ viên trung,<br />
          Chư Tăng nhóm hội rất đông,<br />
          Tính ra đến số hai muôn tám ngàn.<br />
          Lại cũng có các hàng Bồ-tát,<br />
          Hội tại đây đủ mặt thường thường,<br />
          Bấy giờ Phật lại lên đường,<br />
          Cùng hàng đại chúng Nam phương tiến hành.<br />
          Bên đường bỗng rành rành mắt thấy,<br />
          Núi xương khô bỏ đấy lâu đời,<br />
          Thế Tôn bèn vội đến nơi,<br />
          Lạy liền ba lạy, rồi rơi giọt hồng.<br />
          Đức A-nan tủi lòng ái ngại,<br />
          Chẳng hiểu sao Phật lạy đống xương,<br />
          Vội vàng xin Phật dạy tường:<br />
          Thầy là Từ phụ ba phương bốn loài.
        </p>
      </div>
    ),
    // Trang 16
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Phần 2)</h3>
        <p>
          Ai ai cũng kính Thầy dường ấy<br />
          Cớ sao Thầy lại lạy xương khô?<br />
          Phật rằng: Trong các môn đồ,<br />
          Ông là đệ tử đứng đầu dày công.<br />
          Bởi chưa biết đục trong chưa rõ,<br />
          Nên vì ngươi ta tỏ đuôi đầu.<br />
          Đống xương dồn dập bấy lâu,<br />
          Cho nên trong đó biết bao cốt hài.<br />
          Chắc cũng có ông bà, cha mẹ,<br />
          Hoặc thân ta, hoặc kẻ ta sanh,<br />
          Luân hồi sanh tử, tử sanh,<br />
          Lục thân đời trước, thi hài còn đây.<br />
          Ta lễ bái kính người tiền bối,<br />
          Và ngậm ngùi vì nhớ kiếp xưa,<br />
          Đống xương hỗn tạp chẳng vừa,<br />
          Không phân trai gái bỏ bừa khó coi.
        </p>
      </div>
    ),
    // Trang 17
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Phần 3)</h3>
        <p>
          Ngươi chịu khó xét soi cho kỹ,<br />
          Phân làm hai bên nữ, bên nam,<br />
          Để cho phân biệt cốt phàm,<br />
          Không còn lộn lạo nữ nam chất chồng.<br />
          Đức A-nan trong lòng ái ngại,<br />
          Biết làm sao phân biệt khỏi sai,<br />
          Vội vàng xin Phật chỉ bày,<br />
          Vì khó chọn lựa gái trai lúc này.<br />
          Còn sanh tiền dễ bề sắp đặt,<br />
          Cách đứng đi ăn mặc phân minh,<br />
          Chớ khi rã xác tiêu hình,<br />
          Xương ai như nấy, khó nhìn khó phân.<br />
          Phật mới bảo A-nan nên biết,<br />
          Xương nữ nam phân biệt rõ ràng,<br />
          Đàn ông xương trắng nặng oằn,<br />
          Đàn bà xương nhẹ đen thâm dễ nhìn.
        </p>
      </div>
    ),
    // Trang 18
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Phần 4)</h3>
        <p>
          Ngươi có biết cớ sao đen nhẹ?<br />
          Bởi đàn bà sinh đẻ mà ra,<br />
          Sanh con ba đấu huyết ra,<br />
          Tám hộc bốn đấu sữa hòa nuôi con.<br />
          Vì cớ ấy hao mòn thân thể,<br />
          Xương đàn bà, đen nhẹ hơn trai.<br />
          A-nan nghe vậy bi ai,<br />
          Xót thương cha mẹ công dày dưỡng sanh.<br />
          Bèn cầu Phật thi ân dạy bảo,<br />
          Phương pháp nào báo hiếu song thân?<br />
          Thế Tôn mới bảo lời rằng:<br />
          Vì ngươi Ta sẽ phân trần trước sau:<br />
          Thân đàn bà nhiều bề cực nhọc,<br />
          Sanh đặng con mười tháng cưu mang,<br />
          Tháng đầu thai đậu tợ sương,<br />
          Mai chiều gìn giữ sợ tan bất thường.
        </p>
      </div>
    ),
    // Trang 19
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Phần 5)</h3>
        <p>
          Tháng thứ nhì dường như sữa đặc,<br />
          Tháng thứ ba như cục huyết ngưng,<br />
          Bốn tháng đã tượng ra hình,<br />
          Năm tháng ngũ thể hiện sinh rõ ràng.<br />
          Tháng thứ sáu lục căn đầy đủ,<br />
          Bảy tháng thì đủ bộ cốt xương,<br />
          Lại thêm đủ lỗ chân lông,<br />
          Cộng chung số đến tám muôn bốn ngàn.<br />
          Tháng thứ tám hoàn toàn tạng phủ,<br />
          Chín tháng thì đầy đủ vóc hình,<br />
          Mười tháng thì đến kỳ sinh.<br />
          Nếu con hiếu thuận xuôi mình ra luôn,<br />
          Bằng ngỗ nghịch làm buồn thân mẫu.<br />
          Nó vẫy vùng đạp vấu lung tung,<br />
          Làm cho cha mẹ hãi hùng,<br />
          Sự đau sự khổ không cùng tỏ phân.
        </p>
      </div>
    ),
    // Trang 20
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Mười Điều Ân)</h3>
        <p>
          Sinh được con muôn phần an lạc,<br />
          Cũng ví như được bạc được vàng,<br />
          Thế Tôn lại bảo A-nan:<br />
          Ơn cha nghĩa mẹ mười phần phải tin.<br />
          <strong>Điều thứ nhất</strong> giữ gìn thai giáo,<br />
          Mười tháng trường chu đáo mọi bề,<br />
          <strong>Thứ hai</strong> sanh đẻ gớm ghê,<br />
          Chịu đau chịu khổ mỏi mê trăm phần.<br />
          <strong>Điều thứ ba</strong> thâm ân nuôi dưỡng,<br />
          Cực đến đâu bền vững chẳng lay,<br />
          <strong>Thứ tư</strong> ăn đắng nuốt cay,<br />
          Để dành bùi ngọt đủ đầy cho con.<br />
          <strong>Điều thứ năm</strong> lại còn khi ngủ,<br />
          Ướt mẹ nằm, khô ráo phần con,<br />
          <strong>Thứ sáu</strong> sú nước nhai cơm,<br />
          Miễn con no ấm chẳng nhờm chẳng ghê.
        </p>
      </div>
    ),
    // Trang 21
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>Phật Nói Kinh Báo Hiếu Công Ơn Cha Mẹ (Tiếp theo)</h3>
        <p>
          <strong>Điều thứ bảy</strong> không chê ô uế,<br />
          Giặt đồ dơ của trẻ không phiền,<br />
          <strong>Thứ tám</strong> chẳng nỡ chia riêng,<br />
          Nếu con đi vắng cha phiền mẹ lo.<br />
          <strong>Điều thứ chín</strong> miễn con sung sướng,<br />
          Dầu phải mang nghiệp chướng cũng cam,<br />
          Tính sao có lợi thì làm,<br />
          Chẳng màng tội lỗi, bị giam bị cầm.<br />
          <strong>Điều thứ mười</strong> chẳng ham trau chuốt,<br />
          Dành cho con các cuộc thanh nhàn,<br />
          Thương con như ngọc như vàng,<br />
          Ơn cha nghĩa mẹ, sánh bằng Thái Sơn.
        </p>
      </div>
    ),
    // Trang 22
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>8. Kinh Tinh Hoa Trí Tuệ (Bát-nhã Tâm Kinh)</h3>
        <p>
          Quán Tự Tại thực hành trí tuệ,<br />
          Bát-nhã ba-la-mật sáng ngời,<br />
          Bấy giờ Bồ-tát quán soi,<br />
          Thấy rằng năm uẩn ba đời đều không. O<br />
          Vượt tất cả các vòng khổ ách,<br />
          Hãy nghe này, Xá-lợi-phất ông!<br />
          Sắc nào có khác gì không,<br />
          Không nào khác sắc, sắc không vốn đồng. O<br />
          Cả thọ, tưởng, thức, hành cũng thế.<br />
          Tánh chân không các pháp viên thành,<br />
          Thảy đều chẳng diệt, chẳng sanh,<br />
          Chẳng nhơ, chẳng sạch, chẳng tăng giảm gì. O
        </p>
      </div>
    ),
    // Trang 23
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>8. Kinh Tinh Hoa Trí Tuệ (Tiếp theo)</h3>
        <p>
          Trong chân không chẳng hề có sắc.<br />
          Chẳng thọ, tưởng, hành, thức trong không.<br />
          Mắt, tai, mũi, lưỡi, ý thân,<br />
          Sắc, thanh, vị, xúc, pháp, hương không còn. O<br />
          Không nhãn thức đến không ý thức,<br />
          Không vô minh hoặc hết vô minh,<br />
          Không điều già chết chúng sanh,<br />
          Hết già, hết chết thực tình cũng không.<br />
          Không trí huệ cũng không chứng đắc,<br />
          Bởi có gì là chỗ đắc đâu.<br />
          Bấy lâu Bồ-tát dựa vào<br />
          Trí ba-la-mật thẳm sâu thực hành,
        </p>
      </div>
    ),
    // Trang 24
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>8. Kinh Tinh Hoa Trí Tuệ (Hoàn mãn)</h3>
        <p>
          Mọi chướng ngại quanh mình tan biến,<br />
          Mọi việc đều chẳng khiến hoảng kinh,<br />
          Xa lìa mộng tưởng đảo điên,<br />
          Niết-bàn rốt ráo an nhiên thanh nhàn. O<br />
          Bát-nhã ấy rõ ràng trí tuệ,<br />
          Mà ba đời chư Phật nương vào,<br />
          Chứng thành quả giác tối cao,<br />
          Nên xem Bát-nhã thâm sâu đó là: O<br />
          <em>Lời thần chú sâu xa bậc nhứt,<br />
          Lời chú thần rất mực quang minh,<br />
          Chú thần cao cả anh linh,<br />
          Là lời thần chú thật tình cao siêu.<br />
          Trừ dứt được mọi điều đau khổ,<br />
          Đúng như vầy muôn thuở không sai.</em><br />
          Ngài liền tuyên nói chú này,<br />
          Để người trì niệm sáng bày chơn tâm: O<br />
          <strong>Ga-tê ga-tê pa-ra-ga-tê pa-ra-săn-ga-tê bô-dhi sva-ha</strong> (3 lần) OOO
        </p>
      </div>
    ),
    // Trang 25
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>9. Niệm Phật</h3>
        <p>
          A-di-đà Phật sắc thân vàng,<br />
          Tướng tốt không gì thể sánh ngang.<br />
          Mắt biếc lắng trong trùm bốn biển,<br />
          Tu-di rực rỡ ngập hào quang.<br />
          Trong ánh quang minh vô số Phật,<br />
          Ứng thân Bồ-tát hiện vô vàn.<br />
          Bốn mươi tám nguyện vì sanh chúng,<br />
          Chín loại noi đường, bến giác sang. O<br /><br />
          <strong>Nam-mô Tây Phương Cực Lạc Thế Giới Đại Từ Đại Bi Tiếp Dẫn Đạo Sư A-di-đà Phật.</strong> O<br />
          <strong>Nam-mô A-di-đà Phật</strong> (18 lần) O<br />
          <strong>Nam-mô Quán Thế Âm Bồ-tát</strong> (3 lần) O<br />
          <strong>Nam-mô Đại Thế Chí Bồ-tát</strong> (3 lần) O<br />
          <strong>Nam-mô Địa Tạng Vương Bồ-tát</strong> (3 lần) O<br />
          <strong>Nam-mô Thanh Tịnh Đại Hải Chúng Bồ-tát</strong> (3 lần) OOO
        </p>
      </div>
    ),
    // Trang 26
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-A. Sám Mười Ân Đức Của Mẹ</h3>
        <p>
          (1). Nghiệp lực dẫn chúng sanh / Gá vào trong thai mẹ / Cưu mang chín tháng trời / Khổ đau không trách kể.<br />
          Hoài thai như mang đá / Thương con ngại gió mưa / Áo quần không sửa soạn / Son phấn chẳng còn ưa! O<br /><br />
          (2). Đến đầu tháng thứ mười / Lòng mẹ lo khôn tả / Ngày tợ hoàng hôn rồi / Đêm đau sầu bao nả.<br />
          Khiếp hãi bởi lo âu / Âm thầm dòng lệ chảy / Tử thần phút đối đầu / Mong sao cho thoát khỏi. O<br /><br />
          (3). Ngay giây phút sinh nở / Ruột gan mẹ tả tơi / Đớn đau trong mê sảng / Ôi máu huyết dầm dề!<br />
          Khi biết con “ra” khỏe / Mẹ vui mừng khôn nguôi / Niềm vui vừa chợt đó / Chấp nối nỗi lo rồi. O
        </p>
      </div>
    ),
    // Trang 27
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-A. Sám Mười Ân Đức Của Mẹ (Tiếp theo)</h3>
        <p>
          (4). Tình mẹ thật sâu nặng, / Thương con nào nhạt phai. / Nhả ngọt không tiếc nuối, / Nuốt đắng nào chua cay.<br />
          Thương con càng sâu đậm, / Sầu bi tăng đêm ngày. / Miễn sao con no ấm, / Đói khát chẳng nguôi ngoai! O<br /><br />
          (5). Mẹ nhường khô nằm ướt / Để cho con ngủ say / Đôi vú no con bú, / Nâng niu suốt đêm ngày.<br />
          Thương con quên ngủ nghỉ, / Tình thương ấm con tim. / Mong sao con yên ổn, / Lòng mẹ hiền mới yên. O<br /><br />
          (6). Ân mẹ hiền hơn đất, / Đức cha nghiêm quá trời. / Chở che con nào quản, / Cha mẹ chẳng tính lời.<br />
          Dù sanh con tàn tật / Cha mẹ vẫn thương con. / Con sinh từ cha mẹ, / Sao đổi dạ quên Người?! O
        </p>
      </div>
    ),
    // Trang 28
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-A. Sám Mười Ân Đức Của Mẹ (Hoàn mãn)</h3>
        <p>
          (7). Nào quản thân phận mình / Chỉ sợ con bệnh tật / Tắm rửa lo vóc hình / Để con luôn khỏe mạnh.<br />
          Sắm áo đẹp cho con / Cũ rách riêng mình chịu / Mỗi khi con ấm lòng / Lòng mẹ mới xoa dịu!<br /><br />
          (8). Khi sanh ly tử biệt / Đau đớn biết dường nào / Thương con mà xa vắng / Lại càng khổ biết bao.<br />
          Con đi đường xa cách, / Lòng mẹ bóng theo hình. / Phút giây không yên dạ / Thương nhớ đến đoạn trường. O<br /><br />
          (9). Cuộc sống đầy lao khổ / Kế sinh nhai rối bời / Vì muốn con no ấm / Việc ác khó chối lời.<br />
          Cơm áo cho con sống / Nuôi nấng dựng tương lai / Chỉ vì con ngon miệng / Mẹ chiên nấu bao loài. O<br /><br />
          (10). Ân cha hơn núi lớn / Nghĩa mẹ hơn đất dày / Hy sinh lòng chẳng quản / Mà vẫn không nguôi ngoai.<br />
          Mẹ già hơn trăm tuổi / Vẫn thương con tám mươi. / Tình thương nào ngơi nghỉ, / Đến hơi thở cuối đời! OOO
        </p>
      </div>
    ),
    // Trang 29
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-B. Sám Vu-Lan</h3>
        <p>
          Đệ tử chúng con / Vâng lời Phật dạy / Ngày rằm tháng bảy / Gặp hội Vu-lan,<br />
          Phạm vũ huy hoàng / Đốt hương đảnh lễ / Mười phương tam thế / Phật Pháp Thánh Hiền.<br />
          Noi gương đức Mục-kiền-liên / Nguyện làm con thảo O<br />
          Lòng càng áo não / Nhớ nghĩa thân sinh / Con đến trưởng thành / Mẹ dày gian khổ,<br />
          Ba năm nhũ bộ / Chín tháng cưu mang, / Không ngớt lo toan / Quên ăn bỏ ngủ.<br />
          Ấm no đầy đủ / Cậy có công cha / Chẳng quản yếu già / Sanh nhai lam lũ<br />
          Quyết cùng hoàn vũ / Phấn đấu nuôi con / Giáo dục vuông tròn / Đem đường học đạo.
        </p>
      </div>
    ),
    // Trang 30
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-B. Sám Vu-Lan (Tiếp theo)</h3>
        <p>
          Đệ tử ơn sâu chưa báo / Hỗ phận kém hèn / Giờ này quỳ trước đài sen.<br />
          Chí thành cung kính. / Đạo tràng thanh tịnh, / Tăng bảo trang nghiêm,<br />
          Hoặc thừa tự tứ / Hoặc hiện tham thiền / Đầy đủ thiện duyên / Dũ lòng lân mẫn<br />
          Hộ niệm cho O<br />
          Bảy kiếp cha mẹ chúng con / Đượm nhuần mưa pháp;<br />
          Còn tại thế / Thân tâm yên ổn / Phát nguyện tu trì;<br />
          Đã qua đời / Ác đạo xa lìa / Chóng thành Phật quả.<br />
          Ngưỡng mong các đức Như Lai / Khắp cõi hư không / Từ bi gia hộ. O<br />
          <strong>Nam-mô Đại Hiếu Mục-kiền-liên Bồ-tát.</strong> OOO
        </p>
      </div>
    ),
    // Trang 31
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-C. Sám Bốn Ơn</h3>
        <p>
          Kính lạy mười phương Phật / Xin chứng tấm lòng thành / Con nguyện tu hạnh hiếu / Đền ơn Phật, chúng sanh.<br />
          Công sanh thành dưỡng dục / Hơn núi cả, biển khơi / Con có mặt trên đời / Ơn cha mẹ trước hết. O<br />
          Mười tháng mẹ cưu mang / Lâm bồn như lâm nạn / Đau khổ chẳng thở than / Tình mẹ hiền lai láng!<br />
          Công cha luôn tần tảo / Tìm kiếm kế sinh nhai / Chịu bao nỗi đắng cay / Nuôi vợ con thơ dại.<br />
          Ơn cha như biển cả / Nghĩa mẹ tợ trời cao / Con khó thể đáp đền / Chỉ hết lòng hiếu thảo. O
        </p>
      </div>
    ),
    // Trang 32
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-C. Sám Bốn Ơn (Tiếp theo)</h3>
        <p>
          Nguyện sống đời hiền thiện / Không thẹn với tổ tiên / Cả nhà cùng tu học / Niềm hạnh phúc vô biên!<br />
          Có thân thờ cha mẹ / Nên thân nhờ sư trưởng / Dạy lễ nghĩa cho ta / Mới thành người cao thượng. O<br />
          Kiến thức ở thế gian / Nhờ thầy được mở mang / Đạo lý xuất thế gian / Cũng nhờ thầy chỉ đàng.<br />
          Người dù có thông minh / Không thể hiểu một mình / Nhờ ơn thầy dạy dỗ / Mới thoát khổ tử sinh.<br />
          Nguyện hết lòng kính ngưỡng / Đối với bậc minh sư / Theo chân thầy hoằng pháp / Gian khổ cũng không từ! O
        </p>
      </div>
    ),
    // Trang 33
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-C. Sám Bốn Ơn (Hoàn mãn)</h3>
        <p>
          Ơn nhà nông cày cấy / Ơn người thợ dệt may / Ơn những ai xây đắp / Cuộc sống đẹp hôm nay.<br />
          Ơn đất nước thiêng liêng / Biển cả đến đất liền / Chung đúc nên nhân kiệt / Dòng giống của tổ tiên. O<br />
          Nguyện sống đời trong sạch / Góp sức dựng tương lai / Nương nhau cùng tồn tại / Xin nhớ ơn muôn loài.<br />
          Nhờ Phật con được biết / Ân nghĩa của mẹ cha / Công ơn Thầy dạy dỗ / Ơn muôn loài bao la! O<br />
          Nguyện tinh tấn tu học / Nối dòng Phật ở đời / Dù gian khổ không lơi / Để đền ơn đức Phật. / Núi mòn dạ chẳng mòn / Lòng hiếu kính sắc son / Nguyện đền bốn ơn nặng / Chư Phật chứng lòng con. OOO
        </p>
      </div>
    ),
    // Trang 34
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-D. Sám Tống Táng (Phần 1)</h3>
        <p>
          Cuộc hồng trần xoay vần quá ngán,<br />
          Kiếp phù sinh tụ tán mấy hồi,<br />
          Người đời có biết chăng ôi,<br />
          Thân này tuy có, có rồi hoàn không! O<br />
          Chiêm bao khéo khuấy lạ lùng,<br />
          Mơ màng trong một giấc nồng mà chi,<br />
          Làm cho buồn bã thế ni!<br />
          Hình dung mới đó bữa nay đâu rồi?<br />
          Khi nào đứng đứng ngồi ngồi<br />
          Bây giờ lặng ngắt như chồi cây khô.<br />
          Khi nào du lịch giang hồ<br />
          Bây giờ nhắm mắt mà vô quan tài.<br />
          Khi nào lược giắt trâm cài<br />
          Bây giờ gởi xác ra ngoài gò hoang.
        </p>
      </div>
    ),
    // Trang 35
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-D. Sám Tống Táng (Phần 2)</h3>
        <p>
          Khi nào trau ngọc chuốt vàng<br />
          Bây giờ một nắm xương tàn lạnh tanh. O<br />
          Khi nào mắt đẹp mày xanh<br />
          Bây giờ thấy dạng thấy hình là đâu.<br />
          Khi nào lên gác xuống lầu<br />
          Bây giờ một nắm cỏ sầu xanh xanh.<br />
          Khi nào liệt liệt oanh oanh<br />
          Bây giờ một trận tan tành gió mưa.<br />
          Khi nào ngựa lọc xe lừa<br />
          Bây giờ mây rước trăng đưa mơ màng.<br />
          Khi nào ra trướng vào màn<br />
          Bây giờ nhà cửa xóm làng cách xa. O
        </p>
      </div>
    ),
    // Trang 36
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-D. Sám Tống Táng (Phần 3)</h3>
        <p>
          Khi nào mẹ mẹ cha cha<br />
          Bây giờ bóng núi cách xa muôn trùng.<br />
          Khi nào vợ vợ chồng chồng<br />
          Bây giờ trăng khuyết còn mong chi tròn.<br />
          Khi nào cháu cháu con con<br />
          Bây giờ hai ngã nước non xa vời.<br />
          Khi nào cốt nhục vẹn mười<br />
          Bây giờ lá héo nhành tươi vui gì.<br />
          Khi nào bạn hữu sum vầy<br />
          Bây giờ chén rượu cuộc kỳ vắng thiu. O<br />
          Cái thân như tấc bóng chiều<br />
          Như chùm bọt nước phập phều biển khơi.
        </p>
      </div>
    ),
    // Trang 37
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-D. Sám Tống Táng (Hoàn mãn)</h3>
        <p>
          Phù du sớm tối một mai<br />
          Giàu sang cũng thác, sạt sài cũng vong.<br />
          Thông minh tài trí anh hùng<br />
          Si mê dại dột cũng chung một gò.<br />
          Biển trần nhiều nỗi gay go<br />
          Mau mau nhẹ gót qua đò sông mê.<br />
          Sự đời nên chán nên chê<br />
          Tầm nơi giải thoát mà về mới khôn. O<br />
          Lắng tâm quyết tỏ nguồn chơn<br />
          Gương xưa lau sạch không còn trần ô.<br />
          Nguyện cho thành Phật để mau độ đời,<br />
          Ban niềm an lạc muôn nơi<br />
          Niết-bàn tỏ ngộ, sáng ngời chân tâm. OOO
        </p>
      </div>
    ),
    // Trang 38
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-E. Sám Niệm Phật</h3>
        <p>
          Một lòng giữ niệm Di-đà, / Hồng danh sáu chữ thật là rất cao, / Năng trừ tám vạn trần lao, / Niệm thời phải tính cách nào cho hay.<br />
          Tham lam dứt bỏ mê si, / Tĩnh tâm niệm Phật việc gì cũng an. / Niệm Phật tội nghiệp tiêu tan, / Những điều tai họa khỏi mang vào mình.<br />
          Niệm Phật phát huệ thông minh, / Bao nhiêu nghiệp chướng chẳng sinh vào lòng. / Niệm Phật cứu được tổ tông, / Ông bà cha mẹ thoát dòng sông mê.<br />
          Niệm Phật hoan hỷ mọi bề, / Thương người lẫn vật chẳng hề khác nhau. / Niệm Phật nhớ trước biết sau, / Thông minh sáng suốt, trí cao lòng hiền. O
        </p>
      </div>
    ),
    // Trang 39
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-E. Sám Niệm Phật (Hoàn mãn)</h3>
        <p>
          Niệm Phật ắt gặp phước duyên, / Tài danh chẳng nhiễm, bình an cửa nhà. / Niệm Phật chẳng sợ tà ma, / Những hàng yêu quái tránh xa chẳng cùng.<br />
          Niệm Phật được lợi ích chung, / Gặp loài ác thú hóa hung ra hiền. / Niệm Phật thân thể được yên, / Trong khi tĩnh tọa tham thiền tâm minh.<br />
          Niệm Phật phổ độ khắp nơi, / Lợi mình lợi kẻ trời người mến thương. / Niệm Phật lòng dạ hiền lương, / Từ bi hỷ xả dẫn đường chúng sanh.<br />
          Niệm Phật như kẻ thả phao, / Trôi qua khổ ải, trần lao khỏi chìm. / Bước lên bờ giác trang nghiêm, / Thấy toàn Phật Thánh chớ tìm đâu xa. / <strong>Nam-mô A-di-đà Phật.</strong> OOO
        </p>
      </div>
    ),
    // Trang 40
    (
      <div>
        <h3 style={{ color: '#e8bd70', borderBottom: '1px solid #443c2e', paddingBottom: '8px' }}>10-F. Sám Nhất Tâm &amp; 10-G. Sám Phát Nguyện</h3>
        <p>
          Một lòng mỏi mệt không nài, / Cầu về Cực Lạc ngồi đài liên hoa. / Cha lành vốn thiệt Di-đà, / Soi hào quang tịnh chói lòa thân con.<br />
          Nguyện làm nên đạo Bồ-đề, / Chuyên lòng niệm Phật, cầu về Tây phương. / Phật xưa lời thệ tỏ tường, / Bốn mươi tám nguyện dẫn đường chúng sanh. O<br /><br />
          <strong>10-G. SÁM PHÁT NGUYỆN</strong><br />
          Nương Phật A-di-đà / Nơi bản môn mầu nhiệm, / Con dốc lòng quay về / Duy trì nguồn chánh niệm.<br />
          Con đã nguyện trở lại, / Nương Phật A-di-đà. / Cúi xin Phật nhiếp thọ. OOO
        </p>
      </div>
    )
  ];

  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ 
      padding: '30px 20px', 
      color: '#f4ead8', 
      backgroundColor: '#1c1b18', 
      minHeight: '100vh',
      lineHeight: '1.8', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'serif' 
    }}>
      <h2 style={{ textAlign: 'center', color: '#e8bd70', marginBottom: '2px' }}>Kinh Vu Lan Báo Hiếu</h2>
      <p style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '15px', color: '#c5b79b' }}>(Bản trì tụng hàng ngày - Đầy đủ các phần)</p>
      
      {/* Khung nội dung */}
      <div style={{ 
        background: '#262420', 
        padding: '25px', 
        borderRadius: '8px', 
        border: '1px solid #3d372c',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        minHeight: '400px'
      }}>
        {pages[currentPage]}
      </div>

      {/* Thanh điều hướng trang */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '25px',
        padding: '0 10px'
      }}>
        <button 
          onClick={handlePrev} 
          disabled={currentPage === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 0 ? '#333' : '#8c6d36',
            color: currentPage === 0 ? '#666' : '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          &larr; Trang trước
        </button>

        <span style={{ color: '#c5b79b', fontSize: '0.95em' }}>
          Trang {currentPage + 1} / {pages.length}
        </span>

        <button 
          onClick={handleNext} 
          disabled={currentPage === pages.length - 1}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === pages.length - 1 ? '#333' : '#8c6d36',
            color: currentPage === pages.length - 1 ? '#666' : '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: currentPage === pages.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Trang sau &rarr;
        </button>
      </div>
    </div>
  );
}