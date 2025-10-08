import SemiCircleMeter from "./components/SemiCircleMeter/SemiCircleMeter";
import { getUserLevelInfo } from "./mocks/points";
import "./App.css";

function App() {
  // テスト用のユーザーID（実際のアプリでは認証ユーザーのIDを使用）
  const userId = "u2";

  // ユーザーレベル情報を取得
  const userLevelInfo = getUserLevelInfo(userId);

  return (
    <div className="App">
      <header className="App-header">
        {userLevelInfo && (
          <SemiCircleMeter userId={userId} points={userLevelInfo.points} />
        )}
      </header>
    </div>
  );
}

export default App;