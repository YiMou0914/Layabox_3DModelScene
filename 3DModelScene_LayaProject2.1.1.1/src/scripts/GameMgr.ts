import CameraSpin from "./CameraSpin";

export default class GameMgr extends Laya.Script {
    constructor() { super(); }

    public static instance: GameMgr;

    public scene3D: Laya.Scene3D;

    onAwake(): void {
        GameMgr.instance = this;
    }

    onEnable(): void {
    }

    onDisable(): void {
    }
    onStart(): void {
        Laya.Scene3D.load("res/LayaScene_scene/Conventional/scene.ls", Laya.Handler.create(this, this.onLoadSceneCmp));
    }

    private onLoadSceneCmp(scenes3D: Laya.Scene3D): void {
        Laya.stage.addChild(scenes3D);
        this.scene3D = scenes3D;
        scenes3D.zOrder = -1;

        var camera = scenes3D.getChildByName("Main Camera");
        camera.addComponent(CameraSpin);
        // this.ball_prefab = Laya.Sprite3D.instantiate(ball as Laya.Sprite3D);
        // this.part = scenes3D.getChildByName("particle") as Laya.ShuriKenParticle3D;
    }
}