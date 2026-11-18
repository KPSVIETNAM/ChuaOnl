# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Quản lý chùa

Tài khoản mới chưa có chức vụ; chỉ tài khoản có `chucVu` mới thấy và mở được trang Quản lý chùa. Để cấp chức vụ cho người quản lý đầu tiên, đặt `users/<username>/chucVu` thành một chuỗi (ví dụ `Trụ trì`) trong Firebase Realtime Database. Sau đó, người này có thể cấp hoặc xóa chức vụ cho các thành viên khác ngay trên trang quản lý.

Chỉ số `chiSoDongGop` được lưu riêng với công đức hiện có: mỗi phút tịnh tâm cộng 1, mỗi lần thỉnh chuông cộng 0,1 và mỗi lần gõ mõ cộng 0,01.
